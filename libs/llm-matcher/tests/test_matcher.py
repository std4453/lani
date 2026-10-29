import copy
import hashlib
import io
import json
from pathlib import Path
import sys
import threading
import time
import unittest
from unittest.mock import patch
from urllib.request import urlopen, Request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from lani_llm_matcher.engine import (Engine, Settings, AttemptError, answer, complete)
from lani_llm_matcher.protocol import ProtocolError, query_input
from lani_llm_matcher.worker import Worker, make_http_server, serve_jsonl


CATALOG = [dict(id='new', title='新篇', aliases=['New'], year=2026, quarter=4,
                declaredEpisodeCount=12, premiereDate='2026-10-01'),
           dict(id='old', title='旧篇', aliases=['Old'], year=2025, quarter=3)]
QUERY = dict(rawTitle='New Season 2 - 03', aliases=['New Season 2'],
             publishedAt='2026-10-29T00:00:00+08:00', episode=3, publisherSeason=2)


def completion(value, **extras):
    return dict(model='synthetic', choices=[dict(finish_reason='stop',
                message=dict(content=json.dumps({'s': value})))],
                usage={'prompt_tokens': 100, 'completion_tokens': 10,
                       'prompt_cache_hit_tokens': 90, 'prompt_cache_miss_tokens': 10}, **extras)


class MatcherTest(unittest.TestCase):
    def test_boolean_environment_is_validated(self):
        environment = dict(LLM_ENDPOINT='http://example.test/chat/completions',
                           LLM_MODEL='test', LLM_API_KEY='secret')
        for value, expected in [('true', True), (' True ', True), ('1', True),
                                ('yes', True), ('false', False), ('FALSE', False),
                                ('0', False), ('no', False)]:
            with self.subTest(value=value), patch.dict('os.environ', dict(environment, LLM_FALLBACK_ENABLED=value), clear=True):
                self.assertEqual(Settings.from_env().fallback_enabled, expected)
        for value in ('', 'ture', '2'):
            with self.subTest(value=value), patch.dict('os.environ', dict(environment, LLM_FALLBACK_ENABLED=value), clear=True):
                with self.assertRaises(ValueError):
                    Settings.from_env()

    def setup_worker(self, responses, **settings):
        self.calls, self.events = [], []
        def call(config, payload, timeout):
            self.calls.append(copy.deepcopy(payload))
            response = responses.pop(0)
            if isinstance(response, Exception):
                raise response
            return response
        self.engine = Engine(Settings('http://example.test/chat/completions', 'test', 'secret', **settings),
                             call, self.events.append)
        self.worker = Worker(self.engine)
        self.worker.dispatch('configure', dict(protocolVersion=2, catalogVersion='v1', catalog=CATALOG))

    def request(self, **changes):
        return dict(protocolVersion=2, catalogVersion='v1', requestId='test',
                    query=QUERY, primaryCandidateIds=['new'], fallbackCandidateIds=['new', 'old'], **changes)

    def test_frozen_prompt_bytes(self):
        root = Path(__file__).resolve().parents[1] / 'lani_llm_matcher' / 'prompts'
        for filename, expected in {
            'first.system.txt': 'cb1c7b157d0840cab3ca2d9724d03e0c9b8f917157cbdc6300dbef6fe8a24dc3',
            'review.system.txt': '03d72de21599c6aa1e5ca35575a4696e9b2829655d94ee69c42b8450273655f7',
        }.items():
            self.assertEqual(hashlib.sha256((root / filename).read_bytes()).hexdigest(), expected)

    def test_primary_and_projection(self):
        self.setup_worker([completion('new')])
        result = self.worker.dispatch('match', self.request())
        self.assertEqual(result['decision']['stage'], 'primary')
        self.assertEqual(len(self.calls), 1)
        prompt = self.calls[0]['messages'][0]['content']
        self.assertIn('{"id":"new","aliases":["新篇","New"],"y":2026,"q":4}', prompt)
        self.assertNotIn('"count":12', prompt)
        self.assertNotIn('old', prompt)
        self.assertEqual(result['diagnostics']['attempts'][0]['cacheHitTokens'], 90)
        self.assertNotIn('secret', json.dumps(result))

    def test_null_falls_back_to_old_season(self):
        self.setup_worker([completion(None), completion('old')])
        result = self.worker.dispatch('match', self.request())
        self.assertEqual(result['result']['seasonId'], 'old')
        self.assertEqual(result['decision'], dict(stage='fallback', fallbackReason='primary_null'))
        prompt = self.calls[1]['messages'][0]['content']
        self.assertIn('"count":12,"premiere":"2026-10-01"', prompt)
        self.assertEqual(self.calls[0]['messages'][-1], self.calls[1]['messages'][-1])
        self.assertEqual(len(self.calls[1]['messages']), 2)

    def test_empty_window_and_empty_catalog(self):
        self.setup_worker([completion('old')])
        request = self.request()
        request['primaryCandidateIds'] = []
        self.assertEqual(self.worker.dispatch('match', request)['result']['seasonId'], 'old')
        self.assertEqual(len(self.calls), 1)
        self.worker.dispatch('configure', dict(protocolVersion=2, catalogVersion='empty', catalog=[]))
        request.update(catalogVersion='empty', fallbackCandidateIds=[])
        self.assertIsNone(self.worker.dispatch('match', request)['result']['seasonId'])
        self.assertEqual(len(self.calls), 1)

    def test_excess_alone_does_not_reject(self):
        self.setup_worker([completion('new')])
        request = self.request()
        request['query'] = dict(QUERY, rawTitle='New - 15', episode=15, publisherSeason=None)
        self.assertEqual(self.worker.dispatch('match', request)['decision']['stage'], 'primary')

    def test_numbering_conflict_and_no_score(self):
        self.setup_worker([completion('new'), completion(None)])
        request = self.request()
        request['query'] = dict(QUERY, episode=15)
        result = self.worker.dispatch('match', request)
        self.assertEqual(result['decision']['fallbackReason'], 'numbering_conflict')
        self.assertIsNone(result['result']['score'])

    def test_technical_retries_are_bounded(self):
        self.setup_worker([AttemptError('INVALID_RESPONSE')] * 4)
        with self.assertRaises(ProtocolError) as caught:
            self.worker.dispatch('match', self.request())
        self.assertEqual(caught.exception.code, 'UPSTREAM_ERROR')
        self.assertEqual(len(self.calls), 4)

    def test_auth_error_is_not_retried(self):
        self.setup_worker([AttemptError('UPSTREAM_HTTP_401', False)])
        with self.assertRaises(ProtocolError):
            self.worker.dispatch('match', self.request())
        self.assertEqual(len(self.calls), 1)

    def test_valid_null_not_retried(self):
        self.setup_worker([completion(None), completion(None)])
        result = self.worker.dispatch('match', self.request())
        self.assertIsNone(result['result']['seasonId'])
        self.assertEqual(len(self.calls), 2)

    def test_entire_deadline_includes_retries_and_queue(self):
        self.setup_worker([AttemptError('INVALID_RESPONSE')] * 4,
                          deadline_seconds=.01, attempt_seconds=.005)
        with self.assertRaises(ProtocolError) as caught:
            self.worker.dispatch('match', self.request())
        self.assertEqual(caught.exception.code, 'TIMEOUT')
        self.assertLess(len(self.calls), 4)

    def test_real_completion_transport_and_no_redirect(self):
        seen = []
        class Handler(BaseHTTPRequestHandler):
            def log_message(self, *_):
                pass
            def do_POST(self):
                body = json.loads(self.rfile.read(int(self.headers['Content-Length'])))
                seen.append((self.path, self.headers.get('Authorization'), body))
                if self.path == '/redirect':
                    self.send_response(302)
                    self.send_header('Location', '/stolen')
                    self.end_headers()
                    return
                payload = json.dumps(completion('new')).encode()
                self.send_response(200)
                self.send_header('Content-Length', str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)
        server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        endpoint = 'http://127.0.0.1:' + str(server.server_port)
        try:
            settings = Settings(endpoint + '/complete', 'local', 'secret')
            self.assertEqual(complete(settings, {'model': 'local'}, 1)['model'], 'synthetic')
            settings = Settings(endpoint + '/redirect', 'local', 'secret')
            with self.assertRaises(AttemptError) as caught:
                complete(settings, {}, 1)
            self.assertFalse(caught.exception.retryable)
            self.assertEqual([entry[0] for entry in seen], ['/complete', '/redirect'])
            self.assertEqual(seen[0][1], 'Bearer secret')
        finally:
            server.shutdown()
            server.server_close()

    def test_header_drip_respects_entire_attempt_deadline(self):
        class Handler(BaseHTTPRequestHandler):
            def log_message(self, *_):
                pass
            def do_POST(self):
                self.rfile.read(int(self.headers['Content-Length']))
                try:
                    self.wfile.write(b'HTTP/1.1 200 OK\r\nX-Drip: ')
                    for _ in range(100):
                        self.wfile.write(b'x')
                        self.wfile.flush()
                        time.sleep(.02)
                except (BrokenPipeError, ConnectionResetError):
                    pass
        server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        threading.Thread(target=server.serve_forever, daemon=True).start()
        settings = Settings('http://127.0.0.1:' + str(server.server_port), 'test', 'secret')
        try:
            begin = time.monotonic()
            with self.assertRaises(AttemptError) as caught:
                complete(settings, {}, .2)
            self.assertEqual(caught.exception.code, 'TIMEOUT')
            self.assertLess(time.monotonic() - begin, .8)
        finally:
            server.shutdown()
            server.server_close()

    def test_malformed_containers_follow_format_retry(self):
        for response in [{'choices': [None]}, {'choices': [{}]},
                         {'choices': [{'finish_reason': 'stop', 'message': None}]},
                         None, [], {'choices': 'bad'}]:
            with self.subTest(response=response), self.assertRaises(AttemptError):
                answer(response, {'new'})
        self.setup_worker([{'choices': [None]}, {'choices': [None]}, completion('old')])
        result = self.worker.dispatch('match', self.request())
        self.assertEqual(result['result']['seasonId'], 'old')
        self.assertEqual(len(self.calls), 3)
        with self.assertRaises(ProtocolError) as caught:
            query_input(dict(QUERY, episode=10**1000))
        self.assertEqual(caught.exception.code, 'INVALID_REQUEST')

    def test_oversized_model_name_does_not_discard_a_valid_match(self):
        response = completion('new')
        response['model'] = 'x' * 129
        self.setup_worker([response])
        result = self.worker.dispatch('match', self.request())
        self.assertEqual(result['result']['seasonId'], 'new')
        self.assertNotIn('model', result['diagnostics']['attempts'][0])

    def test_invalid_outputs(self):
        for content in ['{"s":"null"}', '{"s":4}', '{"s":null,"episode":1}',
                        '{"s":null,"s":"new"}', '[]']:
            response = completion(None)
            response['choices'][0]['message']['content'] = content
            with self.subTest(content=content), self.assertRaises(AttemptError):
                answer(response, {'new'})
        response = completion('new')
        response['choices'][0]['finish_reason'] = 'length'
        with self.assertRaises(AttemptError):
            answer(response, {'new'})

    def test_invalid_catalog_preserves_previous_and_rejects_scope(self):
        self.setup_worker([])
        with self.assertRaises(ProtocolError):
            self.worker.dispatch('configure', dict(protocolVersion=2, catalogVersion='bad', catalog=CATALOG * 2))
        self.assertEqual(self.worker.status()['catalogVersion'], 'v1')
        for field, value in [('fallbackCandidateIds', ['new']), ('primaryCandidateIds', ['x']),
                             ('fallbackCandidateIds', ['new', 'old', 'old'])]:
            request = self.request()
            request[field] = value
            with self.assertRaises(ProtocolError):
                self.worker.dispatch('match', request)

    def test_metadata_only_changes_review_prompt(self):
        self.setup_worker([])
        before = self.worker.rows
        changed = copy.deepcopy(CATALOG)
        changed[0].update(declaredEpisodeCount=24, premiereDate='2026-10-02', episodes=[{'ignored': True}])
        self.worker.dispatch('configure', dict(protocolVersion=2, catalogVersion='v2', catalog=changed))
        self.assertEqual(self.engine.prompt(before, ['new'], 'primary'),
                         self.engine.prompt(self.worker.rows, ['new'], 'primary'))
        self.assertNotEqual(self.engine.prompt(before, ['new'], 'fallback'),
                            self.engine.prompt(self.worker.rows, ['new'], 'fallback'))

    def test_http_and_jsonl_same_contract(self):
        self.setup_worker([completion('new')])
        server = make_http_server(self.worker, '127.0.0.1', 0)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            endpoint = 'http://127.0.0.1:' + str(server.server_port)
            with urlopen(endpoint + '/v2/status') as res:
                self.assertEqual(json.load(res)['protocolVersion'], 2)
            req = Request(endpoint + '/v2/match', json.dumps(self.request()).encode(), method='POST')
            with urlopen(req) as res:
                self.assertEqual(json.load(res)['result']['seasonId'], 'new')
        finally:
            server.shutdown()
            server.server_close()
        output = io.StringIO()
        serve_jsonl(self.worker, io.BytesIO(b'{"id":1,"method":"status","protocolVersion":2}\n'), output)
        self.assertEqual(json.loads(output.getvalue())['result']['catalogVersion'], 'v1')


if __name__ == '__main__':
    unittest.main()
