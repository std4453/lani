"""无权威状态的 HTTP / JSONL 匹配协议；目录仅作为可丢弃缓存。"""

import argparse
import os
import datetime
import hashlib
import json
import math
from importlib import metadata
from pathlib import Path
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer

MAX_REQUEST_BYTES = 16 * 1024 * 1024
MAX_RESPONSE_BYTES = 16 * 1024 * 1024
SOCKET_TIMEOUT_SECONDS = 30


class ProtocolError(Exception):
    def __init__(self, code, message, status=400):
        super().__init__(message)
        self.code, self.status = code, status

    def payload(self):
        return {"code": self.code, "message": str(self)}


def invalid(message):
    raise ProtocolError("INVALID_REQUEST", message)


def text(value, name, limit=2048, empty=False):
    if not isinstance(value, str) or len(value) > limit or (not empty and not value):
        invalid(f"{name} 必须是有效字符串")
    try:
        value.encode("utf-8")
    except UnicodeError:
        invalid(f"{name} 必须是有效 UTF-8 字符串")
    return value


def titles(value, limit=256):
    if not isinstance(value, list) or len(value) > limit:
        invalid("标题列表无效或过长")
    return [text(v, "标题", empty=True) for v in value]


def number(value):
    try:
        finite = (
            not isinstance(value, bool)
            and isinstance(value, (int, float))
            and math.isfinite(value)
        )
    except OverflowError:
        finite = False
    if not finite:
        invalid("剧集编号必须是有限数字")
    return value


def date(value):
    text(value, "日期")
    try:
        parsed = datetime.datetime.fromisoformat(value.replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            invalid("日期必须包含时区")
        parsed.timestamp()
    except (ValueError, OverflowError, OSError):
        invalid("日期必须是带时区的 ISO 8601")
    return value


def optional_integer(value, name, minimum):
    if value is not None and (type(value) is not int or value < minimum):
        invalid(f"{name} 必须是不小于 {minimum} 的整数或 null")
    return value


def adapt_catalog(catalog, protocol_version=1):
    if not isinstance(catalog, list) or len(catalog) > 10000:
        invalid("季度目录必须是最多 10000 项的列表")
    result, ids = [], set()
    for season in catalog:
        if not isinstance(season, dict):
            invalid("季度条目必须是对象")
        sid = text(season.get("id"), "季度 ID", 200)
        if sid in ids:
            invalid("季度 ID 不能重复")
        ids.add(sid)
        title = text(season.get("title"), "标题", empty=True)
        aliases = list(dict.fromkeys(a for a in [title, *titles(season.get("aliases"))] if a))
        if len(aliases) > 256:
            invalid("合并后的标题列表超过 256 项")
        if "year" not in season or (
            season["year"] is not None and (
                type(season["year"]) is not int or not 1 <= season["year"] <= 9999
            )
        ):
            invalid("year 必须是 1 至 9999 的整数或 null")
        if "quarter" not in season or (
            season["quarter"] is not None
            and (
                type(season["quarter"]) is not int
                or season["quarter"] not in (1, 2, 3, 4)
            )
        ):
            invalid("quarter 必须是 1 至 4 或 null")
        # v2 不消费逐集信息；旧调用方附带该字段也不会影响静态模型。
        episodes = season.get("episodes", []) if protocol_version == 1 else []
        if not isinstance(episodes, list) or len(episodes) > 10000:
            invalid("季度剧集列表无效")
        adapted = []
        for episode in episodes:
            if not isinstance(episode, dict):
                invalid("剧集必须是对象")
            adapted.append(
                {
                    "number": number(episode.get("number")),
                    "airDate": date(episode.get("airDate")),
                }
            )
        # 保留静态季度信息；不从季度或总集数补造逐集播出日期。
        result.append({
            "id": sid, "aliases": aliases, "episodes": adapted,
            "year": season["year"], "quarter": season["quarter"],
            "declaredEpisodeCount": optional_integer(
                season.get("declaredEpisodeCount"), "declaredEpisodeCount", 1
            ),
        })
    return result, ids


def create_matcher(catalog, *, semantic=False, model_dir=None):
    from .runtime_factory import RuntimeFactory

    return RuntimeFactory()(catalog, semantic=semantic, model_dir=model_dir)


def adapt_query(query, protocol_version=1):
    if not isinstance(query, dict):
        invalid("query 必须是对象")
    if protocol_version == 2:
        # 原始标题供其他兼容实现使用；本模型仍只消费调用方给出的别名。
        text(query.get("rawTitle"), "种子标题", empty=True)
    adapted = {
        "aliases": [a for a in titles(query.get("aliases"), 32) if a],
        "publishedAt": date(query.get("publishedAt")),
    }
    if "episode" in query:
        adapted["episode"] = number(query["episode"])
        if adapted["episode"] < 0:
            invalid("剧集编号必须不小于 0")
    if "publisherSeason" in query:
        adapted["season"] = optional_integer(
            query["publisherSeason"], "publisherSeason", 0
        )
    return adapted


def model_version(semantic, *, device="cpu", dtype="float32", profile_path=None):
    """策略、适配代码及固定权重内容决定版本；status 不加载数值运行库。"""
    root = Path(__file__).parent
    names = [
        "static_matcher.py",
        "title_features.py",
        "runtime_common.py",
        "runtime_factory.py",
        "text.py",
        "worker.py",
    ]
    if semantic:
        names += ["raw_qwen.py", "models.py", "assets/models.json"]
    digest = hashlib.sha256()
    for name in names:
        digest.update(name.encode() + b"\0" + (root / name).read_bytes())
    path = Path(profile_path) if profile_path is not None else root / "assets" / (
        "static-semantic.manifest.json" if semantic else "static-lexical.manifest.json"
    )
    content = path.read_bytes()
    profile = json.loads(content)
    filename = profile["tree"]["file"]
    if Path(filename).name != filename or "/" in filename or "\\" in filename:
        raise ValueError("模型权重路径无效")
    digest.update(content + b"\0" + (path.parent / filename).read_bytes())
    digest.update(json.dumps([device, dtype]).encode())
    dependencies = ["numpy", "scipy", "scikit-learn", "rapidfuzz", "lightgbm", "opencc-python-reimplemented"]
    if semantic:
        dependencies += ["torch", "transformers", "onnxruntime", "tokenizers", "pykakasi"]
    for package in dependencies:
        try:
            version = metadata.version(package)
        except metadata.PackageNotFoundError:
            version = "missing"
        digest.update((package + "=" + version).encode())
    mode = "semantic" if semantic else "lexical"
    return f"matcher-static-v1-{mode}-{digest.hexdigest()[:16]}"


class WorkerState:
    def __init__(self, *, semantic=False, model_dir=None, matcher_factory=None,
                 device="cpu", dtype="float32", profile_path=None):
        self.semantic, self.model_dir = semantic, model_dir
        from .runtime_factory import RuntimeFactory
        self.factory = matcher_factory or RuntimeFactory(device=device, dtype=dtype, profile_path=profile_path)
        self.matcher = None
        self.catalog_version = None
        self.ids = set()
        self.model_version = model_version(semantic, device=device, dtype=dtype, profile_path=profile_path)

    def status(self, protocol_version=1):
        return {
            "protocolVersion": protocol_version,
            "catalogVersion": self.catalog_version,
            "modelVersion": self.model_version,
            "mode": "semantic" if self.semantic else "lexical",
        }

    def dispatch(self, method, request, *, protocol_version=None):
        if not isinstance(request, dict):
            invalid("请求必须是 JSON 对象")
        if method != "status" or "protocolVersion" in request:
            if "protocolVersion" not in request:
                invalid("缺少 protocolVersion")
            if (
                type(request["protocolVersion"]) is not int
                or request["protocolVersion"] not in (1, 2)
            ):
                raise ProtocolError("PROTOCOL_UNSUPPORTED", "不支持此协议版本", 422)
        requested_version = request.get("protocolVersion", 1)
        if protocol_version is not None and requested_version != protocol_version:
            raise ProtocolError("PROTOCOL_UNSUPPORTED", "请求版本与路径不符", 422)
        if method == "status":
            return self.status(requested_version)
        if method not in ("configure", "match"):
            invalid("未知请求方法")
        version = text(request.get("catalogVersion"), "目录版本", 256)
        if method == "configure":
            catalog, ids = adapt_catalog(request.get("catalog"), requested_version)
            if version != self.catalog_version:
                replacement = self.factory(
                    catalog, semantic=self.semantic, model_dir=self.model_dir
                )
                # 完整构建成功后才发布；同版本由调用方保证同内容。
                self.matcher, self.ids, self.catalog_version = replacement, ids, version
            return self.status(requested_version)
        request_id = text(request.get("requestId"), "请求 ID", 2048)
        adapted = adapt_query(request.get("query"), requested_version)

        def candidate_ids(field):
            candidates = request.get(field)
            if not isinstance(candidates, list) or len(candidates) > 10000:
                invalid(f"必须显式提供 {field} 列表")
            candidates = [text(c, "候选 ID", 200) for c in candidates]
            if len(set(candidates)) != len(candidates):
                invalid("候选 ID 不能重复")
            return candidates

        candidates = candidate_ids("primaryCandidateIds" if requested_version == 2 else "candidateIds")
        fallback = candidate_ids("fallbackCandidateIds") if requested_version == 2 else None
        if self.matcher is None:
            raise ProtocolError("CATALOG_MISSING", "目录缓存为空，请显式恢复目录", 409)
        if version != self.catalog_version:
            raise ProtocolError("CATALOG_MISMATCH", "请求版本与当前目录不同", 409)
        if not set(candidates).issubset(self.ids):
            invalid("候选 ID 不在当前目录中")
        if fallback is not None and set(fallback) != self.ids:
            invalid("fallbackCandidateIds 必须完整覆盖当前目录")
        result = (
            self.matcher.match(adapted, candidates)
            if candidates
            else {"seasonId": None, "reason": "no_candidates", "score": None}
        )
        if (
            not isinstance(result, dict)
            or "seasonId" not in result
            or (result["seasonId"] is not None and result["seasonId"] not in candidates)
        ):
            raise RuntimeError("Matcher returned an out-of-scope result")
        return {
            **self.status(requested_version),
            "requestId": request_id,
            **({"decision": {"stage": "primary"}} if requested_version == 2 else {}),
            "result": {
                k: result[k] for k in ("seasonId", "reason", "score") if k in result
            },
        }


def decode(raw):
    def bad_constant(_value):
        raise ValueError("Invalid JSON number")

    try:
        if isinstance(raw, bytes):
            raw = raw.decode("utf-8")
        return json.loads(raw, parse_constant=bad_constant)
    except (ValueError, UnicodeError, RecursionError):
        invalid("JSON 请求无效")


def encode(value):
    return json.dumps(
        value, ensure_ascii=False, separators=(",", ":"), allow_nan=False
    ).encode("utf-8")


def failure(error):
    if isinstance(error, ProtocolError):
        return error
    print("Anime matcher operation failed", file=sys.stderr, flush=True)
    return ProtocolError("INTERNAL_ERROR", "内部错误", 500)


def serve_jsonl(input_stream, output_stream, **options):
    state = WorkerState(**options)
    while True:
        line = input_stream.readline(MAX_REQUEST_BYTES + 1)
        if not line:
            return
        request_id = None
        newline = b"\n" if isinstance(line, bytes) else "\n"
        oversized = len(line) > MAX_REQUEST_BYTES or (
            isinstance(line, str) and len(line.encode("utf-8")) > MAX_REQUEST_BYTES
        )
        if oversized and not line.endswith(newline):
            while True:
                chunk = input_stream.readline(MAX_REQUEST_BYTES + 1)
                if not chunk or chunk.endswith(newline):
                    break
        try:
            if oversized:
                invalid("请求超过 16 MiB")
            request = decode(line)
            if not isinstance(request, dict):
                invalid("请求必须是 JSON 对象")
            rid = request.get("id")
            if type(rid) is not int or abs(rid) > 9007199254740991:
                invalid("id 必须是安全整数")
            request_id = rid
            response = {
                "id": rid,
                "result": state.dispatch(request.get("method"), request),
            }
            body = encode(response)
            if len(body) + 1 > MAX_RESPONSE_BYTES:
                raise RuntimeError("Response too large")
        except Exception as error:
            body = encode({"id": request_id, "error": failure(error).payload()})
        output_stream.write(body.decode("utf-8") + "\n")
        output_stream.flush()


class _TimedHTTPServer(HTTPServer):
    def get_request(self):
        request, address = super().get_request()
        request.settimeout(SOCKET_TIMEOUT_SECONDS)
        return request, address

    def handle_error(self, _request, _client_address):
        print("Anime matcher HTTP connection failed", file=sys.stderr, flush=True)


def make_http_server(host="127.0.0.1", port=8090, **options):
    state = WorkerState(**options)

    class Handler(BaseHTTPRequestHandler):
        server_version = "LaniAnimeMatcher/1.0"
        sys_version = ""

        def log_message(self, _format, *_args):
            return

        def send_payload(self, status, payload):
            body = encode(payload)
            if len(body) > MAX_RESPONSE_BYTES:
                raise RuntimeError("Response too large")
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Connection", "close")
            self.end_headers()
            self.wfile.write(body)
            self.close_connection = True

        def handle_operation(self, method, route):
            protocol_version = 2 if self.path.startswith("/v2/") else 1
            try:
                if self.path != f"/v{protocol_version}/{route}":
                    raise ProtocolError("INVALID_REQUEST", "未找到请求路径", 404)
                payload = {"protocolVersion": protocol_version}
                if method != "status":
                    lengths = self.headers.get_all("Content-Length", [])
                    if (
                        self.headers.get("Transfer-Encoding")
                        or len(lengths) != 1
                        or not lengths[0].isascii()
                        or not lengths[0].isdigit()
                    ):
                        invalid("必须提供唯一有效的 Content-Length")
                    try:
                        length = int(lengths[0])
                    except ValueError:
                        invalid("Content-Length 无效")
                    if length > MAX_REQUEST_BYTES:
                        invalid("请求超过 16 MiB")
                    raw = self.rfile.read(length)
                    if len(raw) != length:
                        invalid("请求正文不完整")
                    payload = decode(raw)
                self.send_payload(200, state.dispatch(method, payload, protocol_version=protocol_version))
            except Exception as error:
                failure_value = failure(error)
                self.send_payload(
                    failure_value.status,
                    {"protocolVersion": protocol_version, "error": failure_value.payload()},
                )

        def do_GET(self):
            self.handle_operation("status", "status")

        def do_PUT(self):
            self.handle_operation("configure", "catalog")

        def do_POST(self):
            self.handle_operation("match", "match")

    return _TimedHTTPServer((host, port), Handler)


def main(argv=None):
    parser = argparse.ArgumentParser(description="Lani anime season matcher worker")
    parser.add_argument("--semantic", action=argparse.BooleanOptionalAction,
                        default=os.environ.get("LANI_MATCHER_SEMANTIC", "false") == "true")
    parser.add_argument("--model-dir")
    parser.add_argument("--device", choices=("cpu", "cuda"), default=os.environ.get("LANI_MATCHER_DEVICE", "cpu"))
    parser.add_argument("--dtype", choices=("float32", "bfloat16", "float16"), default="float32")
    parser.add_argument("--profile", type=Path, help="Explicit static model profile manifest")
    parser.add_argument("--http", action="store_true")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8090)
    args = parser.parse_args(argv)
    if args.semantic and args.device == "cuda":
        import torch
        if not torch.cuda.is_available():
            parser.error("CUDA was explicitly requested but is unavailable")
    options = {"semantic": args.semantic, "model_dir": args.model_dir,
               "device": args.device, "dtype": args.dtype, "profile_path": args.profile}
    if args.http:
        server = make_http_server(args.host, args.port, **options)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
        finally:
            server.server_close()
    else:
        serve_jsonl(sys.stdin.buffer, sys.stdout, **options)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
