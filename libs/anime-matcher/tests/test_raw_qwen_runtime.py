"""raw reranker的纯CPU合同测试；真实0.6B smoke仅通过显式环境变量启用。"""
import json
import math
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from types import SimpleNamespace

ROOT = Path(__file__).parents[1]
sys.path.insert(0, str(ROOT / 'python'))
from lani_anime_matcher import raw_qwen as raw
from lani_anime_matcher.runtime_common import pack_prompt, prompt_parts


def write_manifest(root, model='0.6b'):
    spec = raw.MODEL_SPECS[model]
    files = []
    for name in spec['files']:
        path = root / name
        path.write_bytes(name.encode())
        files.append(dict(file=name, bytes=path.stat().st_size, sha256=raw.sha256(path)))
    value = dict(revision=spec['revision'], files=files)
    value['repository'] = spec['repository']
    path = root / spec['manifest']
    path.write_text(json.dumps(value))
    return path, value


class Tokenizer:
    pad_token_id = 0
    def encode(self, value, add_special_tokens=False):
        if add_special_tokens:
            raise AssertionError('No extra special tokens')
        return [ord(c) for c in value]


class FakeScorer(raw.RawQwenScorer):
    def _load(self):
        self.tokenizer = Tokenizer()
        self.batches = []
        self.runtime_info = {}
    def _infer(self, packed):
        self.batches.append(packed)
        return [(float(sum(row) / 100), -.5) for row in packed]


class RawQwenTests(unittest.TestCase):
    def test_native_inference_disables_implicit_jit_without_changing_device(self):
        triton = SimpleNamespace(enabled=True)
        torch = SimpleNamespace(backends=SimpleNamespace(
            python_native=SimpleNamespace(triton=triton)))
        raw.configure_native_inference(torch)
        self.assertFalse(triton.enabled)
        # 旧版 PyTorch 没有该 backend，仍可用于固定输入的升级对照。
        raw.configure_native_inference(SimpleNamespace(backends=SimpleNamespace()))

    def test_manifest_revision_size_hash_and_path_are_bound(self):
        for model in raw.MODEL_SPECS:
            with self.subTest(model=model), tempfile.TemporaryDirectory() as tmp:
                root = Path(tmp)
                path, manifest = write_manifest(root, model)
                digest = raw.sha256(path)
                self.assertEqual(raw.verify_model(root, model, digest), manifest)
                with self.assertRaises(ValueError):
                    raw.verify_model(root, model, '0' * 64)
                (root / 'config.json').write_bytes(b'tampered')
                with self.assertRaises(ValueError):
                    raw.verify_model(root, model, digest)
                path, manifest = write_manifest(root, model)
                manifest['revision'] = 'wrong'
                path.write_text(json.dumps(manifest))
                with self.assertRaises(ValueError):
                    raw.verify_model(root, model, raw.sha256(path))
                path, manifest = write_manifest(root, model)
                manifest['files'].append(dict(manifest['files'][0]))
                path.write_text(json.dumps(manifest))
                with self.assertRaises(ValueError):
                    raw.verify_model(root, model, raw.sha256(path))
                path, manifest = write_manifest(root, model)
                manifest['files'][0]['file'] = '../config.json'
                path.write_text(json.dumps(manifest))
                with self.assertRaises(ValueError):
                    raw.verify_model(root, model, raw.sha256(path))

    def test_unsupported_model_is_rejected_before_reading_files(self):
        with self.assertRaisesRegex(ValueError, '未知'):
            raw.verify_model('/nonexistent', '4b', '0' * 64)

    def test_batch8_stable_order_restoration_and_precise_cache_identity(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            path, _ = write_manifest(root)
            scorer = FakeScorer(root, model='0.6b', expected_manifest_sha256=raw.sha256(path),
                                device='cpu', dtype='float32', cache_size=2)
            pairs = [([f'Query {i}' + 'x' * (11 - i)], ['Candidate']) for i in range(11)]
            result = scorer.score_pairs(pairs)
            self.assertEqual([len(batch) for batch in scorer.batches], [8, 3])
            expected_packed = [pack_prompt(scorer.tokenizer, prompt_parts(*pair), raw.MAX_LENGTH) for pair in pairs]
            self.assertEqual([row for batch in scorer.batches for row in batch], sorted(expected_packed, key=len))
            for row, packed in zip(result, expected_packed):
                self.assertEqual(row['yesLogit'], sum(packed) / 100)
                self.assertEqual(row['logit'], row['yesLogit'] - row['noLogit'])
                self.assertFalse(row['truncated'])
            self.assertEqual(len(scorer.cache), 2)
            # 独立测试容量足够时canonical别名集合缓存与返回值防修改。
            scorer.cache_size = 20
            pair = (['Title II', 'TITLE', 'TITLE'], ['Season 2'])
            a = scorer.score_pairs([pair])[0]
            calls = len(scorer.batches)
            a['logit'] = 0
            b = scorer.score_pairs([(['TITLE', 'Title II'], ['Season 2'])])[0]
            self.assertEqual(len(scorer.batches), calls)
            self.assertNotEqual(b['logit'], 0)
            scorer.score_pairs([(['title ii', 'TITLE'], ['Season 2'])])
            self.assertEqual(len(scorer.batches), calls + 1)
            scorer.identity = (*scorer.identity, 'other-model')
            scorer.score_pairs([pair])
            self.assertEqual(len(scorer.batches), calls + 2)
            self.assertEqual(scorer.score_pairs([]), [])

    def test_no_partial_cache_or_silent_truncation(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            path, _ = write_manifest(root)
            scorer = FakeScorer(root, model='0.6b', expected_manifest_sha256=raw.sha256(path),
                                device='cpu', dtype='float32')
            with self.assertRaises(ValueError):
                scorer.score_pairs([(['x' * 3000], ['Candidate'])])
            self.assertEqual(scorer.batches, [])
            self.assertFalse(scorer.cache)
            def fail(packed):
                if scorer.batches:
                    return [(float('nan'), 0.)] * len(packed)
                scorer.batches.append(packed)
                return [(1., 0.)] * len(packed)
            scorer._infer = fail
            with self.assertRaises(ValueError):
                scorer.score_pairs([([str(i)], ['Candidate']) for i in range(9)])
            self.assertFalse(scorer.cache)

    def test_padding_and_token_validation_match_frozen_contract(self):
        self.assertEqual(raw.left_pad([[1], [2, 3, 4]], 0), {
            'input_ids': [[0, 0, 1], [2, 3, 4]],
            'attention_mask': [[0, 0, 1], [1, 1, 1]],
        })
        self.assertEqual(raw.left_pad([[1, 2]] * 8, 7), {
            'input_ids': [[1, 2]] * 8,
            'attention_mask': [[1, 1]] * 8,
        })
        for sequences, pad in (([], 0), ([[]], 0), ([[1]], None), ([[1]], -1)):
            with self.assertRaises(ValueError):
                raw.left_pad(sequences, pad)
        for device, dtype, cuda, bf16 in [('cpu', 'float16', False, False), ('cuda', 'float32', False, False),
                                         ('cuda', 'bfloat16', True, False), ('cpu', 'auto', False, False)]:
            with self.assertRaises(ValueError):
                raw.validate_precision(device, dtype, cuda_available=cuda, bf16_supported=bf16)
        self.assertEqual(raw.validate_precision('cuda', 'float32', cuda_available=True, bf16_supported=False), 'float32')
        tokenizer = Tokenizer()
        tokenizer.convert_tokens_to_ids = lambda word: 1
        with self.assertRaises(ValueError):
            raw.token_id(tokenizer, 'yes')

    def test_import_does_not_load_inference_libraries_or_training(self):
        script = '''import sys
from lani_anime_matcher.raw_qwen import RawQwenScorer
assert not any(n in sys.modules for n in ('torch', 'transformers', 'tokenizers', 'numpy', 'lightgbm'))
assert not any(n.startswith('train_') for n in sys.modules)
'''
        subprocess.run([sys.executable, '-c', script], check=True,
                       env={**os.environ, 'PYTHONPATH': str(ROOT / 'python')})


@unittest.skipUnless(os.environ.get('LANI_QWEN_SMOKE_MODEL_DIR') and os.environ.get('LANI_QWEN_SMOKE_MANIFEST_SHA256'),
                     '需显式提供本机0.6B模型目录和可信manifest SHA256才启用真实smoke')
class RealModelSmoke(unittest.TestCase):
    def test_explicit_local_06_fp32(self):
        scorer = raw.RawQwenScorer(os.environ['LANI_QWEN_SMOKE_MODEL_DIR'], model='0.6b',
            expected_manifest_sha256=os.environ['LANI_QWEN_SMOKE_MANIFEST_SHA256'],
            device=os.environ.get('LANI_QWEN_SMOKE_DEVICE', 'cpu'), dtype='float32', cache_size=0)
        values = scorer.score_pairs([(['Example Anime II', '示例动画 第二季'], ['示例动画 第二季']),
                                     (['Example Anime II'], ['Different Work'])])
        self.assertEqual(len(values), 2)
        for row in values:
            self.assertTrue(math.isfinite(row['logit']))
            self.assertEqual(row['logit'], row['yesLogit'] - row['noLogit'])


if __name__ == '__main__':
    unittest.main()
