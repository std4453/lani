"""在断网容器内验证成品依赖、内置权重、默认模式及无 GPU 覆盖。"""
import importlib.util
import json
import os
import subprocess
import sys
import time
import urllib.request

variant = sys.argv[1]
semantic = variant != 'lexical'
assert os.environ['LANI_MATCHER_SEMANTIC'] == str(semantic).lower()
assert os.environ['LANI_MATCHER_DEVICE'] == ('cuda' if variant == 'semantic-cu126' else 'cpu')
if semantic:
    import torch
    from lani_anime_matcher.models import verify
    assert torch.__version__ == '2.14.1+' + ('cu126' if variant == 'semantic-cu126' else 'cpu')
    for name in ['e5-base', 'qwen-0.6b']:
        verify(None, name)
else:
    for module in ['torch', 'transformers', 'onnxruntime']:
        assert importlib.util.find_spec(module) is None, module

def check(extra, expected):
    proc = subprocess.Popen(['lani-anime-matcher', '--http', '--port', '18090', *extra])
    try:
        deadline = time.monotonic() + 30
        while True:
            if proc.poll() is not None:
                raise AssertionError('Worker exited before listening')
            try:
                status = json.load(urllib.request.urlopen('http://127.0.0.1:18090/v1/status', timeout=1))
                break
            except OSError:
                if time.monotonic() > deadline:
                    raise
                time.sleep(.1)
        assert status['mode'] == expected, status
        catalog = {'protocolVersion': 1, 'catalogVersion': 'image-test', 'catalog': [
            {'id': 's1', 'title': '葬送的芙莉莲', 'aliases': ['葬送のフリーレン'], 'year': 2023, 'quarter': 4}]}
        request = urllib.request.Request('http://127.0.0.1:18090/v1/catalog', data=json.dumps(catalog).encode(), method='PUT', headers={'Content-Type':'application/json'})
        json.load(urllib.request.urlopen(request, timeout=120))
        match = {'protocolVersion':1, 'catalogVersion':'image-test', 'requestId':'image-test', 'query':{'aliases':['葬送のフリーレン'],'publishedAt':'2023-10-01T12:00:00+08:00','episode':1},'candidateIds':['s1']}
        request = urllib.request.Request('http://127.0.0.1:18090/v1/match', data=json.dumps(match).encode(), method='POST', headers={'Content-Type':'application/json'})
        result = json.load(urllib.request.urlopen(request, timeout=120))
        assert result['requestId'] == 'image-test', result
        print(json.dumps({'variant':variant, 'mode':expected, 'result':result},ensure_ascii=False))
    finally:
        proc.terminate()
        proc.wait(timeout=10)

check(['--device','cpu'] if variant == 'semantic-cu126' else [], 'semantic' if semantic else 'lexical')
if variant == 'semantic-cu126':
    check(['--no-semantic'], 'lexical')
    if not torch.cuda.is_available():
        result = subprocess.run(['lani-anime-matcher','--semantic','--device','cuda'], input='', text=True, capture_output=True, timeout=30)
        assert result.returncode != 0 and 'CUDA was explicitly requested but is unavailable' in result.stderr
print('Image verification passed: ' + variant)
