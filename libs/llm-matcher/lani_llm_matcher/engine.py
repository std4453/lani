"""冻结的两阶段匹配；模型端点、参数及预算全部属于 matcher。"""
from dataclasses import dataclass, field
import hashlib
import json
import os
from pathlib import Path
import re
import socket
import sys
import threading
import time
from urllib import request as http, error as http_error, parse

from .protocol import ProtocolError, encode, numeric

PROMPTS = Path(__file__).parent / "prompts"
EXPLICIT_SEASON = re.compile(r'(?:\bS\d{1,2}(?:E\d|\b)|\b\d{1,2}(?:st|nd|rd|th)\b|\bSeason\s+\d{1,2}\b|第[一二三四五六七八九十0-9]+季)', re.I)


def digest(value):
    return hashlib.sha256(value.encode()).hexdigest()


@dataclass(frozen=True)
class Settings:
    endpoint: str
    model: str
    api_key: str = field(repr=False)
    deadline_seconds: float = 100
    attempt_seconds: float = 45
    concurrency: int = 2
    fallback_enabled: bool = True
    first_parameters: dict = field(default_factory=dict)
    review_parameters: dict = field(default_factory=dict)

    def __post_init__(self):
        url = parse.urlsplit(self.endpoint)
        if url.scheme not in ('http', 'https') or not url.netloc or url.username or url.password or url.fragment:
            raise ValueError('LLM endpoint must be an HTTP(S) URL without credentials or fragment')
        if not self.model or not self.api_key:
            raise ValueError('LLM model and API key are required')
        if not 0 < self.attempt_seconds <= self.deadline_seconds <= 3600:
            raise ValueError('Invalid LLM timeouts')
        if type(self.concurrency) is not int or not 1 <= self.concurrency <= 32:
            raise ValueError('Invalid LLM concurrency')
        for parameters in (self.first_parameters, self.review_parameters):
            if not isinstance(parameters, dict) or set(parameters) & {'model', 'messages', 'stream', 'response_format'}:
                raise ValueError('Invalid LLM stage parameters')
            encode(parameters)

    @classmethod
    def from_env(cls):
        return cls(
            endpoint=os.environ.get('LLM_ENDPOINT', ''),
            model=os.environ.get('LLM_MODEL', ''),
            api_key=os.environ.get('LLM_API_KEY', ''),
            deadline_seconds=float(os.environ.get('LLM_DEADLINE_SECONDS', '100')),
            attempt_seconds=float(os.environ.get('LLM_ATTEMPT_SECONDS', '45')),
            concurrency=int(os.environ.get('LLM_CONCURRENCY', '2')),
            fallback_enabled=os.environ.get('LLM_FALLBACK_ENABLED', 'true') == 'true',
            first_parameters=json.loads(os.environ.get('LLM_FIRST_PARAMETERS', '{}')),
            review_parameters=json.loads(os.environ.get('LLM_REVIEW_PARAMETERS', '{}')),
        )


class AttemptError(Exception):
    def __init__(self, code, retryable=True):
        super().__init__(code)
        self.code, self.retryable = code, retryable


class NoRedirect(http.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def complete(settings, payload, timeout):
    # 重定向不可携带供应商密钥；错误正文也不进入日志。
    req = http.Request(settings.endpoint, encode(payload).encode(), {
        'Content-Type': 'application/json', 'Authorization': 'Bearer ' + settings.api_key,
    })
    deadline = time.monotonic() + timeout
    try:
        with http.build_opener(NoRedirect()).open(req, timeout=timeout) as response:
            chunks, size = [], 0
            while True:
                remaining = deadline - time.monotonic()
                if remaining <= 0:
                    raise AttemptError('TIMEOUT')
                # read1 每次至多一次底层读取；不断缩短超时，防止滴流响应延长预算。
                if response.fp is not None:
                    response.fp.raw._sock.settimeout(remaining)
                chunk = response.read1(min(65536, 4 * 1024 * 1024 + 1 - size))
                if not chunk:
                    break
                chunks.append(chunk)
                size += len(chunk)
                if size > 4 * 1024 * 1024:
                    raise AttemptError('INVALID_RESPONSE')
            return json.loads(b''.join(chunks))
    except http_error.HTTPError as error:
        raise AttemptError('UPSTREAM_HTTP_' + str(error.code), error.code in (408, 429) or error.code >= 500) from None
    except (http_error.URLError, TimeoutError, socket.timeout, ConnectionError, OSError):
        raise AttemptError('UPSTREAM_UNAVAILABLE') from None
    except (ValueError, UnicodeError, RecursionError):
        raise AttemptError('INVALID_RESPONSE') from None


def usage_record(response):
    usage = response.get('usage') if isinstance(response, dict) else None
    usage = usage if isinstance(usage, dict) else {}
    details = usage.get('completion_tokens_details')
    details = details if isinstance(details, dict) else {}
    prompt_details = usage.get('prompt_tokens_details')
    prompt_details = prompt_details if isinstance(prompt_details, dict) else {}
    values = {
        'promptTokens': usage.get('prompt_tokens'),
        'completionTokens': usage.get('completion_tokens'),
        'cacheHitTokens': usage.get('prompt_cache_hit_tokens', prompt_details.get('cached_tokens')),
        'cacheMissTokens': usage.get('prompt_cache_miss_tokens'),
        'reasoningTokens': details.get('reasoning_tokens'),
    }
    return {key: value for key, value in values.items()
            if type(value) is int and 0 <= value <= 10**9}


def answer(response, candidates):
    try:
        choices = response['choices']
        if not isinstance(choices, list) or len(choices) != 1:
            raise ValueError()
        choice = choices[0]
        if choice.get('finish_reason') != 'stop':
            raise ValueError()
        content = choice['message']['content']
        if not isinstance(content, str):
            raise ValueError()
        def unique(pairs):
            obj = {}
            for key, value in pairs:
                if key in obj:
                    raise ValueError()
                obj[key] = value
            return obj
        result = json.loads(content, object_pairs_hook=unique)
        if not isinstance(result, dict) or set(result) != {'s'}:
            raise ValueError()
        sid = result['s']
        if sid is not None and (not isinstance(sid, str) or sid not in candidates):
            raise ValueError()
        return sid
    except (KeyError, TypeError, ValueError, RecursionError):
        raise AttemptError('INVALID_RESPONSE') from None


class Engine:
    def __init__(self, settings, completion=complete, log=None):
        self.settings, self.completion = settings, completion
        self.log = log or (lambda event: print(encode(event), file=sys.stderr, flush=True))
        self.semaphore = threading.BoundedSemaphore(settings.concurrency)
        self.first_template = (PROMPTS / 'first.system.txt').read_text()
        self.review_template = (PROMPTS / 'review.system.txt').read_text()
        # 模型配置和推理代码均进入版本；密钥与业务目录不进入提示词或版本。
        identity = dict(vars(settings))
        identity.pop('api_key')
        source = ''.join(path.read_text() for path in sorted(Path(__file__).parent.glob('*.py')))
        self.model_version = 'llm-v2-' + digest(encode(identity) + source + self.first_template + self.review_template)[:24]

    def prompt(self, rows, ids, stage):
        fields = ('id', 'aliases', 'y', 'q') if stage == 'primary' else ('id', 'aliases', 'y', 'q', 'count', 'premiere')
        # 使用目录顺序，不按动态候选列表重排，保证共享前缀稳定。
        selected = set(ids)
        catalog = '\n'.join(encode({key: row[key] for key in fields})
                            for sid, row in rows.items() if sid in selected)
        template = self.first_template if stage == 'primary' else self.review_template
        return template.replace('{{CATALOG_ROWS}}', catalog)

    def match(self, rows, query, primary, fallback, request_id):
        started = time.monotonic()
        deadline = started + self.settings.deadline_seconds
        if not self.semaphore.acquire(timeout=max(0, deadline - time.monotonic())):
            raise ProtocolError('TIMEOUT', '匹配请求超时', 504)
        attempts, hashes = [], {}
        try:
            def stage(name, ids):
                prompt = self.prompt(rows, ids, name)
                hashes[name] = digest(prompt)
                parameters = ({'temperature': 0, 'max_tokens': 128, **self.settings.first_parameters}
                              if name == 'primary' else {'max_tokens': 8192, **self.settings.review_parameters})
                payload = dict(model=self.settings.model, messages=[
                    {'role': 'system', 'content': prompt},
                    {'role': 'user', 'content': encode(query)},
                ], stream=False, response_format={'type': 'json_object'}, **parameters)
                for attempt in (1, 2):
                    remaining = deadline - time.monotonic()
                    if remaining <= 0:
                        raise AttemptError('TIMEOUT', False)
                    event = dict(stage=name, attempt=attempt)
                    begin = time.monotonic()
                    error = None
                    try:
                        response = self.completion(self.settings, payload, min(remaining, self.settings.attempt_seconds))
                        if time.monotonic() >= deadline:
                            raise AttemptError('TIMEOUT', False)
                        event.update(usage_record(response))
                        model = response.get('model') if isinstance(response, dict) else None
                        if isinstance(model, str) and len(model) <= 256:
                            event['model'] = model
                        value = answer(response, set(ids))
                    except AttemptError as exc:
                        error = exc
                        event['error'] = exc.code
                    finally:
                        event['elapsedMs'] = round((time.monotonic() - begin) * 1000)
                        attempts.append(event)
                        self.log(dict(event='llm_attempt', requestId=request_id, **event))
                    if error is None:
                        return value
                    if not error.retryable or attempt == 2:
                        raise error
                    # 只有本层重试；有限退避计入整个请求截止时间。
                    pause = min(0.25, max(0, deadline - time.monotonic()))
                    time.sleep(pause)

            reason = 'empty_primary'
            selected = None
            if primary:
                try:
                    selected = stage('primary', primary)
                    reason = 'primary_null'
                    if selected is not None:
                        count, episode = rows[selected]['count'], query['episode']
                        explicit = (query['publisherSeason'] or 0) > 0 or bool(EXPLICIT_SEASON.search(query['rawTitle']))
                        conflict = numeric(count) and count > 0 and numeric(episode) and episode > count and explicit
                        if not conflict:
                            return self.result(selected, 'primary', None, attempts, hashes, started)
                        reason = 'numbering_conflict'
                except AttemptError as exc:
                    if not exc.retryable:
                        raise
                    reason = 'primary_error'
            if not self.settings.fallback_enabled:
                if reason == 'primary_error':
                    raise AttemptError('UPSTREAM_UNAVAILABLE', False)
                return self.result(selected, 'primary', None, attempts, hashes, started)
            selected = stage('fallback', fallback) if fallback else None
            return self.result(selected, 'fallback', reason, attempts, hashes, started)
        except AttemptError as exc:
            code = 'TIMEOUT' if exc.code == 'TIMEOUT' else 'UPSTREAM_ERROR'
            raise ProtocolError(code, '外部模型服务调用失败', 504 if code == 'TIMEOUT' else 502) from None
        finally:
            self.semaphore.release()

    @staticmethod
    def result(selected, stage, reason, attempts, hashes, started):
        decision = {'stage': stage}
        if reason:
            decision['fallbackReason'] = reason
        return dict(result={'seasonId': selected, 'score': None}, decision=decision,
                    diagnostics=dict(attempts=attempts, promptHashes=hashes,
                                     elapsedMs=round((time.monotonic() - started) * 1000)))
