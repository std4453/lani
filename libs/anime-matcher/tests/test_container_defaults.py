"""成品默认参数及显式覆盖；真实权重和设备另由容器验收验证。"""
import os
import sys
import types
import unittest
from unittest.mock import patch
from lani_anime_matcher import worker

class ContainerDefaults(unittest.TestCase):
    def test_modes_and_explicit_cpu_override(self):
        for semantic,device,args,expected in [
            ('false','cpu',[],(False,'cpu')),
            ('true','cpu',[],(True,'cpu')),
            ('true','cuda',['--device','cpu'],(True,'cpu')),
            ('true','cuda',['--no-semantic'],(False,'cuda')),
        ]:
            with patch.dict(os.environ,LANI_MATCHER_SEMANTIC=semantic,LANI_MATCHER_DEVICE=device), patch.object(worker,'serve_jsonl') as serve:
                worker.main(args)
                self.assertEqual((serve.call_args.kwargs['semantic'],serve.call_args.kwargs['device']),expected)
                self.assertEqual(serve.call_args.kwargs['dtype'],'float32')

    def test_explicit_unavailable_cuda_fails_before_serving(self):
        torch=types.SimpleNamespace(cuda=types.SimpleNamespace(is_available=lambda:False))
        with patch.dict(sys.modules,torch=torch), patch.object(worker,'serve_jsonl') as serve:
            with self.assertRaises(SystemExit) as error:
                worker.main(['--semantic','--device','cuda'])
            self.assertEqual(error.exception.code,2)
            serve.assert_not_called()
