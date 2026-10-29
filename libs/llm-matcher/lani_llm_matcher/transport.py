"""单次 HTTP 尝试；父进程负责硬截止时间和进程回收。"""
import json
import sys
from urllib import request, error

MAX_RESPONSE_BYTES = 4 * 1024 * 1024


class NoRedirect(request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def main():
    try:
        message = json.load(sys.stdin)
        req = request.Request(message['endpoint'],
                              json.dumps(message['payload'], ensure_ascii=False,
                                         separators=(',', ':'), allow_nan=False).encode(),
                              {'Content-Type': 'application/json',
                               'Authorization': 'Bearer ' + message['apiKey']})
        with request.build_opener(NoRedirect()).open(req, timeout=message['timeout']) as response:
            raw = response.read(MAX_RESPONSE_BYTES + 1)
        if len(raw) > MAX_RESPONSE_BYTES:
            result = {'error': 'INVALID_RESPONSE', 'retryable': True}
        else:
            data = json.loads(raw)
            # 思考正文不会跨越传输边界，也不进入输出或诊断。
            if isinstance(data, dict) and isinstance(data.get('choices'), list):
                for choice in data['choices']:
                    if isinstance(choice, dict) and isinstance(choice.get('message'), dict):
                        choice['message'].pop('reasoning_content', None)
            result = {'data': data}
    except error.HTTPError as exc:
        result = {'error': 'UPSTREAM_HTTP_' + str(exc.code),
                  'retryable': exc.code in (408, 429) or exc.code >= 500}
        exc.close()
    except (ValueError, UnicodeError, RecursionError):
        result = {'error': 'INVALID_RESPONSE', 'retryable': True}
    except Exception:
        result = {'error': 'UPSTREAM_UNAVAILABLE', 'retryable': True}
    sys.stdout.write(json.dumps(result, ensure_ascii=False, separators=(',', ':')))


if __name__ == '__main__':
    main()
