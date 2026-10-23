"""静态运行适配的候选边界、完整标题、缺失字段与权重合同。"""

import gzip
import hashlib
import json
from pathlib import Path
import sys
import tempfile
import unittest

import numpy as np

sys.path.insert(0, str(Path(__file__).parents[1] / 'python'))
from lani_anime_matcher.static_matcher import StaticMatcher, load_profile
from lani_anime_matcher.title_features import TitleFeatures


class Tree:
    def __init__(self, width, scores):
        self.width, self.scores, self.seen = width, scores, None

    def num_feature(self):
        return self.width

    def predict(self, x, num_threads):
        self.seen = x.copy()
        return self.scores


class StaticMatcherTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        self.catalog = [dict(id='first', aliases=['作品', 'Series'], year=2026, quarter=1),
                        dict(id='second', aliases=['作品 第二季', 'Series Part 2'], year=2026, quarter=2)]
        self.query = dict(aliases=['作品 第二季', 'Series Part 2'], episode=14,
                          publishedAt='2026-04-01T12:00:00Z', season=2)

    def profile(self, semantic=False, head='time_no_count'):
        width = (26 if semantic else 19) + (0 if head == 'titles' else 14 if head == 'time_with_count' else 10)
        weights = gzip.compress(b'test tree', mtime=0)
        (self.root / 'tree.txt.gz').write_bytes(weights)
        profile = dict(schemaVersion=1, featureProfile='semantic' if semantic else 'lexical',
                       rerankers=['qwen-0.6b'] if semantic else [], head=head, threshold=.5,
                       tree=dict(file='tree.txt.gz', sha256=hashlib.sha256(weights).hexdigest(), featureCount=width))
        path = self.root / 'profile.json'
        path.write_text(json.dumps(profile))
        return path, width

    def test_caller_only_and_stable_top_with_actual_lexical_retrieval(self):
        path, width = self.profile()
        tree = Tree(width, [.75])
        matcher = StaticMatcher(self.catalog, profile_path=path, booster=tree)
        # 季度、集数甚至高相似标题都不能让不在caller中的季度进入输出。
        result = matcher.match(self.query, ['first'])
        self.assertEqual(result['seasonId'], 'first')
        self.assertEqual(tree.seen.shape, (1, 29))
        self.assertEqual(matcher.match(self.query, []), dict(seasonId=None, reason='no_candidates', score=None))
        tree.scores = [.5, .5]
        self.assertEqual(matcher.match(self.query, ['second', 'first'])['seasonId'], 'first')
        tree.scores = [.49, .48]
        self.assertIsNone(matcher.match(self.query, ['first', 'second'])['seasonId'])
        with self.assertRaises(ValueError):
            matcher.match(self.query, ['outside'])

    def test_episode_catalog_is_ignored_and_static_time_is_required(self):
        path, width = self.profile()
        tree = Tree(width, [.7])
        original = StaticMatcher(self.catalog, profile_path=path, booster=tree)
        original.match(self.query, ['first'])
        expected = tree.seen.copy()
        changed = [{**c, 'episodes': 'malformed data must never be read', 'airDates': [None]}
                   for c in self.catalog]
        matcher = StaticMatcher(changed, profile_path=path, booster=tree)
        matcher.match(self.query, ['first'])
        np.testing.assert_array_equal(tree.seen, expected)
        with self.assertRaisesRegex(ValueError, 'publishedAt'):
            matcher.match({**self.query, 'publishedAt': None}, ['first'])

    def test_full_titles_pass_to_reranker_and_column_order(self):
        path, width = self.profile(semantic=True, head='time_with_count')
        catalog = [{**c, 'declaredEpisodeCount': 12} for c in self.catalog]
        base = TitleFeatures(catalog)

        class Features:
            def __init__(self):
                self.catalog = catalog

            def selected_features(self, query, candidates):
                return np.arange(25, dtype=np.float32)[None, :], np.array([1]), None

        class Scorer:
            def score_pairs(self, pairs):
                self.pairs = pairs
                return [dict(logit=-2.5)]

        scorer, tree = Scorer(), Tree(width, [.9])
        matcher = StaticMatcher(catalog, profile_path=path, features=Features(),
                                scorers={'qwen-0.6b': scorer}, booster=tree)
        matcher.match(self.query, ['second'])
        self.assertEqual(scorer.pairs, [(self.query['aliases'], catalog[1]['aliases'])])
        self.assertEqual(float(tree.seen[0, 25]), -2.5)
        self.assertEqual(float(tree.seen[0, 36]), 1.)  # declared count known放在最后四列首位
        self.assertEqual(float(tree.seen[0, 34]), 1.)  # publisher season known在count前
        self.assertEqual(base.catalog[1]['aliases'][0], '作品 第二季')

    def test_unsupported_semantic_profile_is_rejected(self):
        path, _ = self.profile(semantic=True)
        profile = json.loads(path.read_text())
        profile['rerankers'] = ['qwen-4b']
        path.write_text(json.dumps(profile))
        with self.assertRaisesRegex(ValueError, 'reranker'):
            load_profile(path)

    def test_invalid_profile_weights_and_outputs_fail_closed(self):
        path, width = self.profile()
        tree = Tree(width, [float('nan')])
        matcher = StaticMatcher(self.catalog, profile_path=path, booster=tree)
        with self.assertRaisesRegex(ValueError, '分数'):
            matcher.match(self.query, ['first'])
        profile = json.loads(path.read_text())
        for mutation in (dict(schemaVersion=True), dict(threshold=float('nan')),
                         dict(rerankers=['qwen-0.6b']),
                         dict(tree={**profile['tree'], 'file': '../tree.txt.gz'})):
            path.write_text(json.dumps({**profile, **mutation}))
            with self.assertRaises(ValueError):
                load_profile(path)
        path.write_text(json.dumps(profile))
        (self.root / 'tree.txt.gz').write_bytes(b'changed')
        with self.assertRaisesRegex(ValueError, '校验'):
            load_profile(path)


if __name__ == '__main__':
    unittest.main()
