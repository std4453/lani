"""纯CPU静态输入合同回归；合成期望已固化，不依赖训练代码或旧模型。"""
import json
import os
from pathlib import Path
import subprocess
import sys
import unittest

import numpy as np

ROOT = Path(__file__).parents[1]
sys.path.insert(0, str(ROOT / 'python'))
from lani_anime_matcher import runtime_common as common

FIXTURE = json.loads((Path(__file__).parent / 'fixtures/runtime-common-synthetic-v1.json').read_text())


class Tokenizer:
    def encode(self, text, add_special_tokens=False):
        if add_special_tokens:
            raise AssertionError('Special tokens must be encoded explicitly')
        return list(text.encode('utf8'))


class RuntimeCommonTests(unittest.TestCase):
    def test_module_import_is_lightweight(self):
        script = (
            'import sys; from lani_anime_matcher import runtime_common; '
            'assert not any(n in sys.modules for n in '
            '("numpy", "torch", "transformers", "onnxruntime", "lightgbm")); '
            'assert not any(n.startswith("train_") for n in sys.modules)'
        )
        subprocess.run([sys.executable, '-c', script], check=True,
                       env={**os.environ, 'PYTHONPATH': str(ROOT / 'python')})

    def test_projection_and_title_only_constants(self):
        row = np.arange(40, dtype=np.float32)
        row[17:21] = [365, 0, 365, 0]
        removed = {14, 15, 16, 21, 22, 4, 5, 6, 7, 25, 26, 27, 28, 30, 31}
        expected = [i for i in range(40) if i not in removed]
        self.assertEqual(list(common.ABSOLUTE_TITLE_COLUMNS), expected)
        np.testing.assert_array_equal(common.absolute_title25(row), row[expected])
        for bad in (row[:39], [float('nan')] * 40, np.arange(40)):
            with self.assertRaises(ValueError):
                common.absolute_title25(bad)

    def test_time_features_and_batches_match_synthetic_snapshots(self):
        rows = []
        for case in FIXTURE['timeCases']:
            row = common.raw_time14(**case['input'])
            self.assertEqual(row, case['raw'])
            rows.append(row)
        expected = np.asarray([case['transformedFloat32'] for case in FIXTURE['timeCases']], np.float32)
        actual = np.asarray(common.transform_time14(rows), np.float32)
        np.testing.assert_array_equal(actual, expected)
        for row, transformed in zip(rows, actual):
            np.testing.assert_array_equal(np.asarray(common.transform_time14([row]), np.float32)[0], transformed)
        for head, columns in [('titles', ()), ('time_no_count', (0,1,2,3,4,5,6,7,12,13)),
                              ('time_with_count', (0,1,2,3,4,5,6,7,12,13,8,9,10,11))]:
            np.testing.assert_array_equal(common.select_time_columns(actual, head), actual[:, columns])

    def test_new_static_profile_rejects_invalid_observations(self):
        args = dict(episode=1, published_at='2026-01-01T00:00:00Z', metadata=dict(year=2026, quarter=1))
        for change in (dict(episode=-1), dict(episode=True), dict(episode=float('inf')),
                       dict(metadata=dict(year=0, quarter=None)), dict(metadata=dict(year=10000, quarter=1)),
                       dict(metadata=dict(year=None, quarter=5)), dict(count=0), dict(season=-1),
                       dict(published_at='2026-01-01T00:00:00'), dict(published_at=None)):
            with self.assertRaises(ValueError):
                common.raw_time14(**{**args, **change})
        with self.assertRaises(ValueError):
            common.transform_time14([[2.] * 14])
        missing = common.input_fields(['query'], ['candidate'], {}, {}, None)
        with self.assertRaisesRegex(ValueError, 'publishedAt'):
            common.model_text(missing, 'titles_static_time')
        self.assertEqual(json.loads(common.model_text(missing, 'titles_only')[0]), {'aliases': ['query']})

    def test_complete_alias_and_joint_prompts_match_synthetic_snapshots(self):
        case = FIXTURE['prompt']
        qa, ca = case['queryAliases'], case['candidateAliases']
        self.assertEqual(common.canonical_title_aliases(qa), [' title ', 'TITLE', '作品 II'])
        self.assertEqual(common.canonical_title_aliases(ca), ['作品 Part 2', '标题 第二季'])
        fields = common.input_fields(qa, ca, case['context'], case['metadata'], case['count'])
        self.assertEqual(fields, case['inputFields'])
        parts = common.prompt_parts(qa, ca)
        self.assertEqual(list(parts), case['rawPromptParts'])
        self.assertEqual(parts, common.prompt_parts(list(reversed(qa)), list(reversed(ca))))
        tokenizer = Tokenizer()
        actual = common.pack_prompt(tokenizer, parts, 10000)
        self.assertEqual(actual, list(''.join(case['rawPromptParts']).encode()))
        self.assertEqual(fields['queryAliases'], qa)
        self.assertEqual(fields['candidateAliases'], ca)
        for mode in ('titles_only', 'titles_static_time'):
            frozen = case['joint'][mode]
            q, d = common.model_text(fields, mode)
            self.assertEqual((q, d), (frozen['queryText'], frozen['documentText']))
            self.assertEqual(json.loads(q)['aliases'], qa)
            self.assertEqual(json.loads(d)['aliases'], ca)
            parts = common.prompt_parts(fields=fields, mode=mode)
            self.assertEqual(list(parts), frozen['promptParts'])
            self.assertEqual(common.pack_prompt(tokenizer, parts, 10000), list(''.join(frozen['promptParts']).encode()))
        with self.assertRaises(ValueError):
            common.pack_prompt(tokenizer, common.prompt_parts(qa, ca), len(actual) - 1)
        with self.assertRaises(ValueError):
            common.prompt_parts([], ca)
        self.assertEqual(common.publication_day(case['context']['publishedAt']).isoformat(), '2026-04-01')


if __name__ == '__main__':
    unittest.main()
