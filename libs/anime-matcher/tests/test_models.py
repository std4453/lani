"""模型下载必须校验内容，失败不覆盖已存在的文件；推理不隐式下载。"""

import hashlib
import io
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).parents[1] / 'python'))
from lani_anime_matcher import models


class ModelDownloadTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.assets = self.root / 'assets'
        self.assets.mkdir()
        self.content = b'verified model'
        self.manifest = b'{"revision":"fixed"}\n'
        (self.assets / 'upstream.json').write_bytes(self.manifest)
        self.spec = {'fixture': {
            'files': {'weights.bin': {'url': 'https://example.invalid/weights',
                'sha256': hashlib.sha256(self.content).hexdigest()}},
            'manifestAsset': 'upstream.json', 'manifestFile': 'download-manifest.json',
            'manifestSha256': hashlib.sha256(self.manifest).hexdigest(),
        }}
        self.addCleanup(patch.stopall)
        patch.object(models, 'MANIFEST', self.spec).start()
        patch.object(models, 'ASSETS', self.assets).start()

    def run_cli(self, *args):
        with patch.object(sys, 'argv', ['models', '--model-dir', str(self.root / 'models'), *args]):
            models.main()

    def test_download_and_verify_pinned_manifest_without_repeated_network(self):
        with patch.object(models.urllib.request, 'urlopen', return_value=io.BytesIO(self.content)) as fetch:
            self.run_cli('--model', 'fixture')
            self.assertEqual(fetch.call_count, 1)
        target = models.verify(self.root / 'models', 'fixture')
        self.assertEqual((target / 'download-manifest.json').read_bytes(), self.manifest)
        with patch.object(models.urllib.request, 'urlopen', side_effect=AssertionError('unexpected download')):
            self.run_cli('--model', 'fixture')
            self.run_cli('--verify-only', '--model', 'fixture')

    def test_bad_download_does_not_replace_file_or_leave_partial(self):
        target = self.root / 'models' / 'fixture'
        target.mkdir(parents=True)
        (target / 'weights.bin').write_bytes(b'previous file')
        with patch.object(models.urllib.request, 'urlopen', return_value=io.BytesIO(b'bad')):
            with self.assertRaisesRegex(RuntimeError, 'checksum'):
                self.run_cli('--model', 'fixture')
        self.assertEqual(list(target.iterdir()), [target / 'weights.bin'])
        self.assertEqual((target / 'weights.bin').read_bytes(), b'previous file')

    def test_verify_rejects_corrupt_model_and_manifest(self):
        with patch.object(models.urllib.request, 'urlopen', return_value=io.BytesIO(self.content)):
            self.run_cli('--model', 'fixture')
        target = self.root / 'models' / 'fixture'
        for name in ('weights.bin', 'download-manifest.json'):
            original = (target / name).read_bytes()
            (target / name).write_bytes(b'corrupt')
            with self.assertRaises(RuntimeError):
                models.verify(self.root / 'models', 'fixture')
            (target / name).write_bytes(original)

    def test_default_download_excludes_optional_models(self):
        fake = {name: self.spec['fixture'] for name in ('e5-base', 'qwen-0.6b', 'qwen-4b')}
        with patch.object(models, 'MANIFEST', fake), patch.object(models, 'verify') as verify:
            self.run_cli('--verify-only')
        self.assertEqual([call.args[1] for call in verify.call_args_list], ['e5-base', 'qwen-0.6b'])


if __name__ == '__main__':
    unittest.main()
