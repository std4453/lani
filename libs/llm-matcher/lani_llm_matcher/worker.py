"""v2 HTTP/JSONL worker；目录缓存由 API 显式发布。"""
import argparse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import sys
import threading

from .engine import Engine, Settings
from .protocol import (MAX_BYTES, ProtocolError, candidate_ids, catalog_rows,
                       decode, encode, invalid, query_input, text)


class Worker:
    def __init__(self, engine):
        self.engine = engine
        self.lock = threading.Lock()
        self.version = None
        self.rows = {}

    def status(self):
        with self.lock:
            return self.identity(self.version)

    def identity(self, version):
        return dict(protocolVersion=2, catalogVersion=version,
                    modelVersion=self.engine.model_version, mode='external_llm')

    def dispatch(self, method, request):
        if not isinstance(request, dict):
            invalid('请求必须是对象')
        if type(request.get('protocolVersion')) is not int or request['protocolVersion'] != 2:
            raise ProtocolError('PROTOCOL_UNSUPPORTED', '需要协议 v2', 422)
        if method == 'status':
            return self.status()
        if method not in ('configure', 'match'):
            invalid('未知操作')
        version = text(request.get('catalogVersion'), '目录版本', 256)
        if method == 'configure':
            # 在替换前完成整份校验；旧快照也能继续服务在途匹配。
            rows = catalog_rows(request.get('catalog'))
            with self.lock:
                if self.version != version:
                    self.rows, self.version = rows, version
            return self.identity(version)
        request_id = text(request.get('requestId'), '请求 ID')
        query = query_input(request.get('query'))
        with self.lock:
            if self.version is None:
                raise ProtocolError('CATALOG_MISSING', '目录缓存为空', 409)
            if self.version != version:
                raise ProtocolError('CATALOG_MISMATCH', '目录版本不同', 409)
            rows = self.rows
        primary = candidate_ids(request.get('primaryCandidateIds'), set(rows))
        fallback = candidate_ids(request.get('fallbackCandidateIds'), set(rows))
        if set(fallback) != set(rows) or not set(primary) <= set(fallback):
            invalid('回退候选必须覆盖整份目录并包含首轮候选')
        try:
            response = self.engine.match(rows, query, primary, fallback, request_id)
        except ProtocolError as error:
            self.engine.log(dict(event='llm_failure', requestId=request_id, code=error.code))
            raise
        self.engine.log(dict(event='llm_match', requestId=request_id,
                             seasonId=response['result']['seasonId'],
                             decision=response['decision'],
                             elapsedMs=response['diagnostics']['elapsedMs']))
        return dict(self.identity(version), requestId=request_id, **response)


def failure(error):
    if isinstance(error, ProtocolError):
        return error
    print('LLM matcher operation failed', file=sys.stderr, flush=True)
    return ProtocolError('INTERNAL_ERROR', '匹配器内部错误', 500)


def serve_jsonl(worker, input_stream, output_stream):
    while True:
        line = input_stream.readline(MAX_BYTES + 1)
        if not line:
            return
        rid = None
        try:
            if len(line.encode('utf-8') if isinstance(line, str) else line) > MAX_BYTES:
                while line and not line.endswith('\n' if isinstance(line, str) else b'\n'):
                    line = input_stream.readline(MAX_BYTES + 1)
                invalid('请求超过 16 MiB')
            request = decode(line)
            if not isinstance(request, dict) or type(request.get('id')) is not int or abs(request['id']) > 9007199254740991:
                invalid('id 必须是安全整数')
            rid = request['id']
            response = dict(id=rid, result=worker.dispatch(request.get('method'), request))
        except Exception as error:
            response = dict(id=rid, error=failure(error).payload())
        output_stream.write(encode(response) + '\n')
        output_stream.flush()


def make_http_server(worker, host, port):
    class Server(ThreadingHTTPServer):
        daemon_threads = True
        def get_request(self):
            sock, address = super().get_request()
            sock.settimeout(30)
            return sock, address

        def handle_error(self, request, client_address):
            print('LLM matcher HTTP connection failed', file=sys.stderr, flush=True)

    class Handler(BaseHTTPRequestHandler):
        server_version = 'LaniLLMMatcher/2'
        sys_version = ''

        def log_message(self, *_):
            pass

        def operate(self, method, path):
            status = 200
            try:
                if self.path != path:
                    raise ProtocolError('INVALID_REQUEST', '未找到请求路径', 404)
                request = {'protocolVersion': 2}
                if method != 'status':
                    lengths = self.headers.get_all('Content-Length', [])
                    if self.headers.get('Transfer-Encoding') or len(lengths) != 1 or not lengths[0].isascii() or not lengths[0].isdigit():
                        invalid('需要唯一有效的 Content-Length')
                    length = int(lengths[0])
                    if length > MAX_BYTES:
                        invalid('请求超过 16 MiB')
                    raw = self.rfile.read(length)
                    if len(raw) != length:
                        invalid('请求正文不完整')
                    request = decode(raw)
                response = worker.dispatch(method, request)
            except Exception as error:
                error = failure(error)
                status = error.status
                response = dict(protocolVersion=2, error=error.payload())
            body = encode(response).encode()
            self.send_response(status)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.send_header('Connection', 'close')
            self.end_headers()
            self.wfile.write(body)
            self.close_connection = True

        def do_GET(self):
            self.operate('status', '/v2/status')

        def do_PUT(self):
            self.operate('configure', '/v2/catalog')

        def do_POST(self):
            self.operate('match', '/v2/match')

    return Server((host, port), Handler)


def main():
    parser = argparse.ArgumentParser(description='Lani external LLM matcher')
    parser.add_argument('--http', action='store_true')
    parser.add_argument('--host', default='127.0.0.1')
    parser.add_argument('--port', type=int, default=8090)
    args = parser.parse_args()
    try:
        worker = Worker(Engine(Settings.from_env()))
    except (ValueError, TypeError):
        parser.error('Invalid LLM configuration; check required endpoint, model, API key and stage parameters')
    if args.http:
        with make_http_server(worker, args.host, args.port) as server:
            server.serve_forever()
    else:
        serve_jsonl(worker, sys.stdin.buffer, sys.stdout)


if __name__ == '__main__':
    main()
