"""HTTP 与 JSONL 的 v1/v2 契约、故障恢复和真实模型适配。"""

import copy
import http.client
import io
import json
import subprocess
import sys
import threading
import unittest
from unittest.mock import patch
from lani_anime_matcher import worker

CATALOG = [
    {
        "id": "s1",
        "title": "标题",
        "aliases": ["别名", "标题"],
        "year": None,
        "quarter": None,
        "episodes": [{"number": 1.5, "airDate": "2026-10-01T12:00:00+08:00"}],
        "ignored": True,
    },
    {"id": "s2", "title": "其他标题", "aliases": [], "year": 2026, "quarter": 4},
]
CONFIG = {"protocolVersion": 1, "catalogVersion": "a" * 64, "catalog": CATALOG}
MATCH = {
    "protocolVersion": 1,
    "catalogVersion": "a" * 64,
    "requestId": "torrent:123:v1",
    "query": {
        "aliases": ["别名"],
        "publishedAt": "2026-10-21T12:00:00+08:00",
        "episode": 1.5,
    },
    "candidateIds": ["s1"],
}


class FakeMatcher:
    def __init__(self, catalog, **_options):
        if any(s["id"] == "broken" for s in catalog):
            raise RuntimeError("private failure details")
        self.catalog = catalog

    def match(self, query, candidates):
        self.last_query = query
        if query["aliases"] == ["explode"]:
            raise RuntimeError("private title")
        sid = "outside" if query["aliases"] == ["escape"] else candidates[0]
        return {"seasonId": sid, "reason": "fake", "score": 0.9, "mode": "lexical"}


def config(**updates):
    return {**copy.deepcopy(CONFIG), **updates}


def match(**updates):
    return {**copy.deepcopy(MATCH), **updates}


def match_v2(**updates):
    request = match(protocolVersion=2)
    request["query"]["rawTitle"] = "[发布组] 别名 - 01.5"
    return {**request, **updates}


class ContractTests(unittest.TestCase):
    def http_sequence(self, operations, factory):
        server = worker.make_http_server("127.0.0.1", 0, matcher_factory=factory)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        outputs = []
        try:
            for method, payload in operations:
                verb, path = {
                    "status": ("GET", "/v1/status"),
                    "configure": ("PUT", "/v1/catalog"),
                    "match": ("POST", "/v1/match"),
                }[method]
                if payload.get("protocolVersion") == 2:
                    path = path.replace("/v1/", "/v2/")
                conn = http.client.HTTPConnection(
                    "127.0.0.1", server.server_port, timeout=2
                )
                conn.request(
                    verb,
                    path,
                    None if method == "status" else json.dumps(payload).encode(),
                    {"Content-Type": "application/json"},
                )
                response = conn.getresponse()
                outputs.append((response.status, json.loads(response.read())))
                conn.close()
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=2)
        return outputs

    def both(self, operations):
        created_http, created_jsonl = [], []

        def factory(created):
            def create(catalog, **options):
                value = FakeMatcher(catalog, **options)
                created.append(value)
                return value

            return create

        http = self.http_sequence(operations, factory(created_http))
        source = io.BytesIO(
            b"".join(
                worker.encode({**payload, "id": i, "method": method}) + b"\n"
                for i, (method, payload) in enumerate(operations)
            )
        )
        output = io.StringIO()
        worker.serve_jsonl(source, output, matcher_factory=factory(created_jsonl))
        replies = [json.loads(line) for line in output.getvalue().splitlines()]
        self.assertEqual(len(replies), len(http))
        for i, ((status, expected), actual) in enumerate(zip(http, replies)):
            self.assertEqual(actual["id"], i)
            if status == 200:
                self.assertEqual(actual, {"id": i, "result": expected})
            else:
                self.assertEqual(actual, {"id": i, "error": expected["error"]})
        self.assertEqual(len(created_http), len(created_jsonl))
        return http, created_http

    def test_status_idempotency_title_adapter_and_explicit_candidates(self):
        replies, created = self.both(
            [
                ("status", {}),
                ("configure", config()),
                ("configure", config()),
                ("match", match()),
                ("match", match(candidateIds=["s2"])),
                ("match", match(candidateIds=[])),
                ("status", {}),
            ]
        )
        self.assertIsNone(replies[0][1]["catalogVersion"])
        self.assertEqual(len(created), 1)
        self.assertEqual(created[0].catalog[0]["aliases"], ["标题", "别名"])
        self.assertEqual(created[0].catalog[0]["episodes"][0]["number"], 1.5)
        self.assertEqual(created[0].catalog[1]["episodes"], [])
        self.assertEqual(created[0].catalog[1]["year"], 2026)
        self.assertEqual(created[0].catalog[1]["quarter"], 4)
        self.assertIsNone(created[0].catalog[1]["declaredEpisodeCount"])
        for index, sid in [(3, "s1"), (4, "s2"), (5, None)]:
            self.assertEqual(replies[index][1]["result"]["seasonId"], sid)
            self.assertEqual(replies[index][1]["requestId"], MATCH["requestId"])
            self.assertNotIn("mode", replies[index][1]["result"])
        self.assertEqual(replies[0][1]["modelVersion"], replies[6][1]["modelVersion"])

    def test_static_metadata_preserved_without_episode_schedule(self):
        cfg = config()
        cfg["catalog"][0].pop("episodes")
        cfg["catalog"][0].update(year=2025, quarter=1, declaredEpisodeCount=12)
        request = match(query={**MATCH["query"], "publisherSeason": 2})
        replies, created = self.both([("configure", cfg), ("match", request)])
        self.assertTrue(all(status == 200 for status, _ in replies))
        self.assertEqual(created[0].catalog[0]["declaredEpisodeCount"], 12)
        self.assertEqual(created[0].catalog[0]["episodes"], [])
        self.assertEqual(created[0].last_query["season"], 2)
        # 候选来自调用方，即使静态季度与发布时间相隔很远也不自行过滤。
        self.assertEqual(replies[1][1]["result"]["seasonId"], "s1")
        cfg["catalog"][0]["declaredEpisodeCount"] = None
        request["query"]["publisherSeason"] = None
        replies, created = self.both([("configure", cfg), ("match", request)])
        self.assertTrue(all(status == 200 for status, _ in replies))
        self.assertIsNone(created[0].catalog[0]["declaredEpisodeCount"])
        self.assertIsNone(created[0].last_query["season"])

    def test_invalid_static_metadata_does_not_replace_catalog(self):
        operations = [("configure", config())]
        for value in (True, 0, -1, 1.5, "12", []):
            cfg = config(catalogVersion="b" * 64)
            cfg["catalog"][0]["declaredEpisodeCount"] = value
            operations.append(("configure", cfg))
        for value in (0, -1, 10000):
            cfg = config(catalogVersion="b" * 64)
            cfg["catalog"][0]["year"] = value
            operations.append(("configure", cfg))
        for value in (True, -1, 1.5, "2", []):
            operations.append(("match", match(query={**MATCH["query"], "publisherSeason": value})))
        operations.append(("status", {}))
        replies, created = self.both(operations)
        self.assertTrue(all(status == 400 for status, _ in replies[1:-1]))
        self.assertEqual(replies[-1][1]["catalogVersion"], CONFIG["catalogVersion"])
        self.assertEqual(len(created), 1)

    def test_missing_mismatch_invalid_and_failed_replacement(self):
        broken = config(catalogVersion="b" * 64)
        broken["catalog"][0]["id"] = "broken"
        no_candidates = match()
        del no_candidates["candidateIds"]
        replies, created = self.both(
            [
                ("match", match()),
                ("configure", config()),
                ("match", match(catalogVersion="b" * 64)),
                ("match", match(candidateIds=["unknown"])),
                ("match", match(candidateIds=["s1", "s1"])),
                ("match", no_candidates),
                ("configure", config(catalogVersion="b" * 64, catalog="invalid")),
                ("configure", broken),
                ("status", {}),
                ("match", match()),
                ("configure", config(protocolVersion=3)),
                ("match", match(protocolVersion=3)),
            ]
        )
        for i, status, code in [
            (0, 409, "CATALOG_MISSING"),
            (2, 409, "CATALOG_MISMATCH"),
            (3, 400, "INVALID_REQUEST"),
            (4, 400, "INVALID_REQUEST"),
            (5, 400, "INVALID_REQUEST"),
            (6, 400, "INVALID_REQUEST"),
            (7, 500, "INTERNAL_ERROR"),
            (10, 422, "PROTOCOL_UNSUPPORTED"),
            (11, 422, "PROTOCOL_UNSUPPORTED"),
        ]:
            self.assertEqual(replies[i][0], status)
            self.assertEqual(replies[i][1]["error"]["code"], code)
        self.assertEqual(replies[8][1]["catalogVersion"], CONFIG["catalogVersion"])
        self.assertEqual(replies[9][0], 200)
        self.assertEqual(len(created), 1)

    def test_v2_candidate_scope_and_ignored_model_metadata(self):
        cfg = config(protocolVersion=2)
        cfg["catalog"][0].update(
            premiereDate="2026-10-01", episodes="ignored",
            numbers={"episode": {"local": "1-12", "sort": "14-25"}, "sp": {"sort": "13.5"}},
        )
        request = match_v2()
        request["query"]["rawTitle"] = "escape"
        replies, created = self.both([
            ("status", {"protocolVersion": 2}),
            ("configure", cfg),
            ("match", request),
            ("match", match_v2(candidateIds=["s2"])),
            ("match", match_v2(candidateIds=[])),
        ])
        self.assertTrue(all(status == 200 for status, _ in replies))
        self.assertTrue(all(payload["protocolVersion"] == 2 for _, payload in replies))
        self.assertEqual(created[0].catalog[0]["episodes"], [])
        self.assertNotIn("premiereDate", created[0].catalog[0])
        self.assertNotIn("numbers", created[0].catalog[0])
        self.assertNotIn("rawTitle", created[0].last_query)
        for index, sid in ((2, "s1"), (3, "s2"), (4, None)):
            self.assertEqual(replies[index][1]["result"]["seasonId"], sid)

    def test_v2_requires_raw_title_and_explicit_unique_candidates(self):
        no_raw_title = match_v2()
        del no_raw_title["query"]["rawTitle"]
        no_candidates = match_v2()
        del no_candidates["candidateIds"]
        requests = [no_raw_title, no_candidates, *[
            match_v2(candidateIds=ids)
            for ids in (None, ["s1", "s1"], ["outside"])
        ]]
        replies, _ = self.both([
            ("configure", config(protocolVersion=2)),
            *[("match", request) for request in requests],
        ])
        for status, payload in replies[1:]:
            self.assertEqual(status, 400)
            self.assertEqual(payload["error"]["code"], "INVALID_REQUEST")

    def test_v2_legacy_model_only_returns_from_requested_candidates(self):
        class EscapingMatcher(FakeMatcher):
            def match(self, query, candidates):
                return {"seasonId": "s2"}

        replies = self.http_sequence([
            ("configure", config(protocolVersion=2)),
            ("match", match_v2()),
        ], EscapingMatcher)
        self.assertEqual(replies[1][0], 500)
        self.assertEqual(replies[1][1]["error"]["code"], "INTERNAL_ERROR")

    def test_request_mode_is_ignored_in_both_protocols(self):
        for protocol_version in (1, 2):
            request = match_v2() if protocol_version == 2 else match()
            replies, _ = self.both([
                ("status", {"protocolVersion": protocol_version, "mode": "semantic"}),
                ("configure", config(protocolVersion=protocol_version, mode={"ignored": True})),
                ("match", {**request, "mode": "semantic"}),
            ])
            self.assertTrue(all(status == 200 for status, _ in replies))
            self.assertTrue(all(payload["mode"] == "lexical" for _, payload in replies))
        state = worker.WorkerState(semantic=True, matcher_factory=FakeMatcher)
        self.assertEqual(state.dispatch("status", {"mode": "lexical"})["mode"], "semantic")

    def test_errors_are_not_business_rejections_and_results_cannot_escape(self):
        replies, _ = self.both(
            [
                ("configure", config()),
                *[
                    ("match", match(query={**MATCH["query"], "aliases": [title]}))
                    for title in ("explode", "escape")
                ],
            ]
        )
        for status, payload in replies[1:]:
            self.assertEqual(status, 500)
            self.assertEqual(
                payload["error"], {"code": "INTERNAL_ERROR", "message": "内部错误"}
            )

    def test_validation_and_forward_compatible_optional_fields(self):
        invalids = [
            match(query={"aliases": ["x"]}),
            match(query={**MATCH["query"], "publishedAt": "2026-01-01"}),
            match(query={**MATCH["query"], "episode": True}),
            match(query={**MATCH["query"], "episode": -1}),
            match(query={**MATCH["query"], "aliases": ["a"] * 33}),
            match(candidateIds=None),
        ]
        bad_catalog = config()
        bad_catalog["catalog"][0]["quarter"] = True
        replies, _ = self.both(
            [
                ("configure", config()),
                *[("match", p) for p in invalids],
                ("configure", bad_catalog),
                (
                    "match",
                    match(future=True, query={**MATCH["query"], "future": "ignored"}),
                ),
            ]
        )
        self.assertTrue(all(status == 400 for status, _ in replies[1:-1]))
        self.assertEqual(replies[-1][0], 200)

    def test_real_matcher_uses_title_without_dates_or_source_restriction(self):
        state = worker.WorkerState()
        cat = [
            {
                "id": "custom",
                "title": "独立候选火星邮递员 XYZ",
                "aliases": [],
                "year": None,
                "quarter": None,
            }
        ]
        state.dispatch("configure", config(catalog=cat))
        result = state.dispatch(
            "match",
            match(
                candidateIds=["custom"],
                query={
                    "aliases": [cat[0]["title"]],
                    "publishedAt": "2040-01-01T00:00:00Z",
                    "episode": 2.5,
                },
            ),
        )
        self.assertEqual(result["result"]["seasonId"], "custom")
        # 新实例不恢复任何目录，即使使用相同模型版本。
        restarted = worker.WorkerState()
        self.assertIsNone(restarted.status()["catalogVersion"])
        self.assertEqual(
            restarted.status()["modelVersion"], state.status()["modelVersion"]
        )

    def test_invalid_numeric_and_unicode_values_are_input_errors(self):
        state = worker.WorkerState(matcher_factory=FakeMatcher)
        state.dispatch("configure", config())
        for query in [
            {**MATCH["query"], "episode": 10**400},
            {**MATCH["query"], "aliases": ["\ud800"]},
        ]:
            with self.assertRaises(worker.ProtocolError) as caught:
                state.dispatch("match", match(query=query))
            self.assertEqual(caught.exception.code, "INVALID_REQUEST")

    def test_status_subprocess_loads_no_models_in_either_mode(self):
        for semantic in (False, True):
            source = (
                "from lani_anime_matcher.worker import WorkerState; import sys; s=WorkerState(semantic=%r); assert s.status()['catalogVersion'] is None; assert not any(n in sys.modules for n in ['numpy','lightgbm','onnxruntime','tokenizers','pykakasi'])"
                % semantic
            )
            subprocess.run(
                [sys.executable, "-c", source], check=True, capture_output=True
            )

    def test_actual_jsonl_process_and_restart_restore(self):
        requests = [
            {"id": 1, "method": "status"},
            {"id": 2, "method": "configure", **CONFIG},
            {"id": 3, "method": "match", **match(candidateIds=[])},
        ]
        completed = subprocess.run(
            [sys.executable, "-m", "lani_anime_matcher.worker"],
            input="".join(json.dumps(r) + "\n" for r in requests),
            text=True,
            capture_output=True,
            check=True,
            timeout=15,
        )
        replies = [json.loads(line) for line in completed.stdout.splitlines()]
        self.assertIsNone(replies[0]["result"]["catalogVersion"])
        self.assertEqual(
            replies[1]["result"]["catalogVersion"], CONFIG["catalogVersion"]
        )
        self.assertIsNone(replies[2]["result"]["result"]["seasonId"])
        self.assertEqual(completed.stderr, "")

    def test_jsonl_size_bad_encoding_and_invalid_ids_recover(self):
        source = io.BytesIO(
            b"x" * 260
            + b"\n\xff\nnull\n"
            + b'{"id":"bad","method":"status"}\n'
            + b'{"id":5,"method":"status"}\n'
        )
        output = io.StringIO()
        with patch.object(worker, "MAX_REQUEST_BYTES", 128):
            worker.serve_jsonl(source, output)
        replies = [json.loads(l) for l in output.getvalue().splitlines()]
        self.assertEqual(len(replies), 5)
        self.assertTrue(
            all(r["error"]["code"] == "INVALID_REQUEST" for r in replies[:4])
        )
        self.assertEqual(replies[-1]["id"], 5)
        self.assertIsNone(replies[3]["id"])

    def test_http_body_limits_and_bad_json_use_structured_errors(self):
        server = worker.make_http_server("127.0.0.1", 0)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            for body in (b"{bad}", b"\xff", b'{"protocolVersion":NaN}', b"x" * 129):
                with patch.object(worker, "MAX_REQUEST_BYTES", 128):
                    conn = http.client.HTTPConnection(
                        "127.0.0.1", server.server_port, timeout=2
                    )
                    conn.request("PUT", "/v1/catalog", body)
                    res = conn.getresponse()
                    self.assertEqual(res.status, 400)
                    self.assertEqual(
                        json.loads(res.read())["error"]["code"], "INVALID_REQUEST"
                    )
                    conn.close()
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=2)

    def test_http_path_and_request_protocol_versions_must_agree(self):
        server = worker.make_http_server("127.0.0.1", 0, matcher_factory=FakeMatcher)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            for path_version, request_version in ((1, 2), (2, 1)):
                conn = http.client.HTTPConnection("127.0.0.1", server.server_port, timeout=2)
                conn.request("PUT", f"/v{path_version}/catalog", json.dumps(config(protocolVersion=request_version)))
                response = conn.getresponse()
                payload = json.loads(response.read())
                conn.close()
                self.assertEqual(response.status, 422)
                self.assertEqual(payload["protocolVersion"], path_version)
                self.assertEqual(payload["error"]["code"], "PROTOCOL_UNSUPPORTED")
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=2)


if __name__ == "__main__":
    unittest.main()
