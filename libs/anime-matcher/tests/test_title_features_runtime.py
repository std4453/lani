"""共同标题核心的合成CPU回归；只依赖保留runtime和固化合成fixture。"""
import collections
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import types
import unittest

import numpy as np

ROOT = Path(__file__).parents[1]
sys.path.insert(0, str(ROOT / 'python'))
from lani_anime_matcher.title_features import TitleFeatures, E5Encoder

FIXTURE = json.loads((Path(__file__).parent / 'fixtures/title-features-synthetic-v1.json').read_text())


class Encoder:
    def embed(self, text):
        data = np.frombuffer(hashlib.sha256(text.encode()).digest(), dtype=np.uint8).astype(np.float32) - 128
        return data / np.linalg.norm(data)


class Romanizer:
    def convert(self, text):
        return [{'hepburn': 'roman' + str(ord(c))} for c in text]


class TitleFeaturesTests(unittest.TestCase):
    def test_selected_columns_and_retrieval_match_synthetic_snapshots(self):
        for semantic in (False, True):
            with self.subTest(semantic=semantic):
                core = TitleFeatures(FIXTURE['catalog'], semantic=semantic,
                    **(dict(encoder=Encoder(), romanizer=Romanizer()) if semantic else {}))
                for case in FIXTURE['cases']:
                    if case['semantic'] != semantic:
                        continue
                    query = dict(aliases=case['aliases'])
                    caller = list(reversed(list(core.ids)))
                    actual, ci, prepared = core.selected_features(query, caller)
                    np.testing.assert_array_equal(ci, case['candidates'])
                    expected = np.asarray(case['selected'], np.float32)
                    if semantic:
                        # FP32 点积在不同 CPU/BLAS 上有舍入差异；其余特征和候选顺序仍精确校验。
                        vector_columns = [3, 21, 22, 23, 24]
                        exact_columns = [i for i in range(25) if i not in vector_columns]
                        np.testing.assert_allclose(actual[:, vector_columns], expected[:, vector_columns],
                                                   rtol=0, atol=2e-7)
                        np.testing.assert_array_equal(actual[:, exact_columns], expected[:, exact_columns])
                    else:
                        np.testing.assert_array_equal(actual, expected)
                    self.assertEqual(actual.shape[1], 25 if semantic else 19)
                    self.assertLessEqual(len(ci), 35 if semantic else 20)
                    self.assertIs(core.prepare(case['aliases']), prepared)
                    full, same, _ = core.features(query, caller)
                    np.testing.assert_array_equal(same, ci)
                    np.testing.assert_array_equal(full[:,17:21], np.tile([365,0,365,0], (len(ci),1)))
                self.assertEqual(core.catalog[0]['year'], 2026)
                self.assertNotIn('models', core.__dict__)

    def test_empty_caller_scope_and_stable_ties(self):
        core = TitleFeatures([dict(id=str(i), aliases=['same']) for i in range(30)])
        _, candidates, _ = core.features(dict(aliases=['same']), list(reversed(list(core.ids))))
        np.testing.assert_array_equal(candidates, np.arange(10))
        for query, caller in [(dict(aliases=[]), list(core.ids)), (dict(aliases=['same']), [])]:
            x, candidates, _ = core.features(query, caller)
            self.assertEqual(x.shape, (0, 40))
            self.assertEqual(candidates.size, 0)
        for caller in (['missing'], ['0', '0'], None):
            with self.assertRaises(ValueError):
                core.features(dict(aliases=['same']), caller)
        empty = TitleFeatures([])
        self.assertEqual(empty.selected_features(dict(aliases=['same']), [])[0].shape, (0, 19))

    def test_catalog_wide_tfidf_is_retained_with_caller_subset(self):
        core = TitleFeatures(FIXTURE['catalog'])
        case = FIXTURE['subset']
        actual, ci, _ = core.selected_features(dict(aliases=case['aliases']), case['caller'])
        np.testing.assert_array_equal(ci, case['candidates'])
        np.testing.assert_array_equal(actual, np.asarray(case['selected'], np.float32))
        self.assertEqual(len(core.catalog), 39)

    def test_lexical_import_and_initialization_avoid_neural_and_old_policy(self):
        script = '''import sys
from lani_anime_matcher.title_features import TitleFeatures
m = TitleFeatures([dict(id='s', aliases=['Title'])])
m.selected_features(dict(aliases=['Title']), ['s'])
assert not any(x in sys.modules for x in ('torch', 'onnxruntime', 'tokenizers', 'pykakasi', 'lightgbm', 'lani_anime_matcher.matcher', 'lani_anime_matcher.semantic'))
'''
        subprocess.run([sys.executable, '-c', script], check=True,
                       env={**os.environ, 'PYTHONPATH': str(ROOT / 'python')})

    def test_e5_batch_one_pooling_and_cache(self):
        class Session:
            def __init__(self):
                self.calls = 0
            def run(self, outputs, feed):
                self.calls += 1
                self.feed = feed
                return [np.arange(12, dtype=np.float32).reshape(1, 3, 4)]
        inputs = []
        def encode(text):
            inputs.append(text)
            return types.SimpleNamespace(ids=[1,2,0], attention_mask=[1,1,0], type_ids=[0,0,0])
        actual = E5Encoder.__new__(E5Encoder)
        actual.session = Session()
        actual.tokenizer = types.SimpleNamespace(encode=encode)
        actual.names, actual.output, actual.cache = {'token_type_ids'}, 'output', collections.OrderedDict()
        np.testing.assert_array_equal(actual.embed('Title'), np.asarray(FIXTURE['e5PooledVector'], np.float32))
        actual.embed('Title')
        self.assertEqual(actual.session.calls, 1)
        self.assertEqual(inputs, ['query: Title'])
        self.assertEqual(actual.session.feed['input_ids'].shape, (1,3))
        np.testing.assert_array_equal(actual.session.feed['attention_mask'], [[1,1,0]])
        np.testing.assert_array_equal(actual.session.feed['token_type_ids'], [[0,0,0]])


if __name__ == '__main__':
    unittest.main()
