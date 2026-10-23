"""目录更新复用语义模型，但不共享权威目录或引入隐式联网。"""
import gzip
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).parents[1]
sys.path.insert(0, str(ROOT / 'python'))
from lani_anime_matcher.runtime_factory import RuntimeFactory


class RuntimeFactoryTests(unittest.TestCase):
    def test_constructor_does_not_load_models(self):
        subprocess.run([sys.executable, '-c',
            'import sys; from lani_anime_matcher.runtime_factory import RuntimeFactory; '
            'RuntimeFactory(); assert not any(n in sys.modules for n in '
            '("numpy", "lightgbm", "torch", "onnxruntime", "transformers"))'],
            env={**os.environ, 'PYTHONPATH': str(ROOT / 'python')}, check=True)
        with self.assertRaises(ValueError):
            RuntimeFactory(device='cpu', dtype='bfloat16')

    def test_lexical_uses_packaged_final_tree(self):
        factory = RuntimeFactory()
        matcher = factory([dict(id='a', aliases=['作品'], year=2026, quarter=1)])
        result = matcher.match(dict(aliases=['作品'], episode=1, publishedAt='2026-01-04T12:00:00Z'), ['a'])
        self.assertIn(result['seasonId'], ('a', None))
        self.assertEqual(matcher.booster.num_feature(), 29)
        self.assertIsNone(factory.encoder)
        self.assertIsNone(factory.scorers)

    def test_refresh_reuses_scorers_and_encoder(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            weights = gzip.compress(b'fixture', mtime=0)
            (root / 'tree.gz').write_bytes(weights)
            model_manifest = root / 'upstream.json'
            model_manifest.write_text('{}')
            profile = dict(schemaVersion=1, featureProfile='semantic', rerankers=['qwen-0.6b'],
                           head='time_no_count', threshold=.5,
                           tree=dict(file='tree.gz', sha256=hashlib.sha256(weights).hexdigest(), featureCount=36))
            (root / 'profile.json').write_text(json.dumps(profile))
            manifest = {'qwen-0.6b': dict(manifestAsset=str(model_manifest),
                                        manifestSha256=hashlib.sha256(model_manifest.read_bytes()).hexdigest())}
            # 不依赖可选pykakasi/ONNX/Torch；替身只记录构造调用。
            from types import SimpleNamespace
            with patch.dict(sys.modules, {'pykakasi': SimpleNamespace(kakasi=lambda: object())}), \
                    patch('lani_anime_matcher.models.MANIFEST', manifest), \
                    patch('lani_anime_matcher.title_features.E5Encoder') as encoder, \
                    patch('lani_anime_matcher.title_features.TitleFeatures') as features, \
                    patch('lani_anime_matcher.raw_qwen.RawQwenScorer') as scorer, \
                    patch('lani_anime_matcher.static_matcher.StaticMatcher'):
                factory = RuntimeFactory(profile_path=root / 'profile.json')
                factory([], semantic=True, model_dir=root)
                factory([dict(id='new')], semantic=True, model_dir=root)
                self.assertEqual(encoder.call_count, 1)
                self.assertEqual(scorer.call_count, 1)
                self.assertEqual(features.call_count, 2)
                with self.assertRaises(ValueError):
                    factory([], semantic=True, model_dir=root / 'different')
                with self.assertRaises(ValueError):
                    factory([], semantic=False, model_dir=root)


if __name__ == '__main__':
    unittest.main()
