"""固定Qwen原始标题reranker；不导入训练代码，不隐式下载或截断。

每次score_pairs的缓存未命中输入按长度稳定排序、固定batch8，末批可更小。
跨请求缓存会改变批次组成，BF16数值可能因此改变；不保证与冻结全量缓存逐bit一致。
"""

import collections
import hashlib
import json
import math
from pathlib import Path

from .runtime_common import canonical_title_aliases, pack_prompt, prompt_parts

MODEL_SPECS = {
    '0.6b': {
        'repository': 'Qwen/Qwen3-Reranker-0.6B',
        'revision': 'e61197ed45024b0ed8a2d74b80b4d909f1255473',
        'manifest': 'download-manifest.json',
        'files': ('config.json', 'tokenizer.json', 'tokenizer_config.json', 'model.safetensors'),
    },

}
BATCH_SIZE = 8
MAX_LENGTH = 2048


def sha256(path):
    digest = hashlib.sha256()
    with Path(path).open('rb') as stream:
        for chunk in iter(lambda: stream.read(8 * 1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def verify_model(model_dir, model, expected_manifest_sha256):
    """调用方提供可信manifest SHA；文件自报hash不足以绑定模型身份。"""
    if model not in MODEL_SPECS:
        raise ValueError('未知的 Qwen 模型规格')
    root = Path(model_dir).resolve()
    spec = MODEL_SPECS[model]
    path = root / spec['manifest']
    if (not isinstance(expected_manifest_sha256, str) or len(expected_manifest_sha256) != 64
            or sha256(path) != expected_manifest_sha256):
        raise ValueError('模型 manifest SHA256 不匹配')
    manifest = json.loads(path.read_text(encoding='utf8'))
    identity = manifest.get('repository')
    if identity != spec['repository'] or manifest.get('revision') != spec['revision']:
        raise ValueError('模型 repository 或 revision 不匹配')
    files = manifest.get('files')
    if not isinstance(files, list) or any(not isinstance(item, dict) for item in files):
        raise ValueError('模型文件清单无效')
    names = [item.get('file') for item in files]
    if any(not isinstance(name, str) or name in ('', '.', '..') or Path(name).name != name for name in names):
        raise ValueError('模型文件名不能包含路径')
    if len(names) != len(set(names)) or not set(spec['files']) <= set(names):
        raise ValueError('模型文件清单缺失或重复')
    for item in files:
        file = root / item['file']
        if (file.resolve().parent != root or type(item.get('bytes')) is not int
                or item['bytes'] < 0 or file.stat().st_size != item['bytes']
                or sha256(file) != item.get('sha256')):
            raise ValueError('模型文件 SHA256 或大小不匹配')
        if item.get('upstreamLfsSha256') and item['upstreamLfsSha256'] != item['sha256']:
            raise ValueError('模型上游权重 SHA256 不匹配')
    # 校验期间manifest发生变化时不采用已读取的身份。
    if sha256(path) != expected_manifest_sha256:
        raise ValueError('模型 manifest 在校验期间发生变化')
    return manifest


def validate_precision(device, dtype, *, cuda_available, bf16_supported):
    if device not in ('cpu', 'cuda') or dtype not in ('float32', 'bfloat16', 'float16'):
        raise ValueError('必须显式指定有效的 device 和 dtype')
    if device == 'cpu' and dtype != 'float32':
        raise ValueError('CPU 推理要求 float32')
    if device == 'cuda' and not cuda_available:
        raise ValueError('CUDA 不可用')
    if device == 'cuda' and dtype == 'bfloat16' and not bf16_supported:
        raise ValueError('当前 CUDA 设备不支持原生 BF16')
    return dtype


def left_pad(sequences, pad_id):
    if not sequences or any(not row for row in sequences) or type(pad_id) is not int or pad_id < 0:
        raise ValueError('左 padding 要求非空 token 序列和有效 pad token ID')
    width = max(map(len, sequences))
    return {
        'input_ids': [[pad_id] * (width - len(row)) + row for row in sequences],
        'attention_mask': [[0] * (width - len(row)) + [1] * len(row) for row in sequences],
    }


def configure_native_inference(torch):
    """使用预编译 ATen 算子，避免新版本 eager 路径隐式触发 Triton JIT。"""
    native = getattr(torch.backends, 'python_native', None)
    if native is not None:
        native.triton.enabled = False


def token_id(tokenizer, token):
    method = getattr(tokenizer, 'convert_tokens_to_ids', None) or tokenizer.token_to_id
    value = method(token)
    encoded = tokenizer.encode(token, add_special_tokens=False)
    encoded = encoded if isinstance(encoded, list) else encoded.ids
    if type(value) is not int or value < 0 or encoded != [value]:
        raise ValueError(f'{token} 必须对应单个独立词表 token')
    return value


class RawQwenScorer:
    def __init__(self, model_dir, *, model, expected_manifest_sha256, device, dtype, cache_size=4096):
        if type(cache_size) is not int or cache_size < 0:
            raise ValueError('cache_size 必须是非负整数')
        # 在导入推理库前拒绝配置和模型身份错误。
        validate_precision(device, dtype, cuda_available=True, bf16_supported=True)
        self.model_dir, self.model_name = Path(model_dir), model
        self.manifest = verify_model(model_dir, model, expected_manifest_sha256)
        self.device, self.dtype = device, dtype
        self.cache_size, self.cache = cache_size, collections.OrderedDict()
        self.identity = (MODEL_SPECS[model]['repository'], MODEL_SPECS[model]['revision'],
                         expected_manifest_sha256, device, dtype, MAX_LENGTH, BATCH_SIZE)
        self._load()

    def _load(self):
        import torch
        import transformers

        configure_native_inference(torch)
        cuda_available = torch.cuda.is_available()
        validate_precision(self.device, self.dtype, cuda_available=cuda_available,
            bf16_supported=cuda_available and torch.cuda.is_bf16_supported(including_emulation=False))
        self.torch = torch
        torch.manual_seed(20261022)
        torch.set_num_threads(4)
        # 保持已验证的执行精度，不使用自动混合精度。
        torch.backends.cuda.matmul.allow_tf32 = False
        torch.backends.cudnn.allow_tf32 = False
        self.tokenizer = transformers.AutoTokenizer.from_pretrained(
            self.model_dir, local_files_only=True, trust_remote_code=False, padding_side='left')
        self.yes_id, self.no_id = [token_id(self.tokenizer, token) for token in ('yes', 'no')]
        if self.yes_id == self.no_id:
            raise ValueError('yes 与 no 的 token ID 不能相同')
        if type(self.tokenizer.pad_token_id) is not int or self.tokenizer.pad_token_id < 0:
            raise ValueError('模型缺少有效的 pad token ID')
        loaded, info = transformers.AutoModelForCausalLM.from_pretrained(
            self.model_dir, local_files_only=True, trust_remote_code=False,
            torch_dtype=getattr(torch, self.dtype), attn_implementation='sdpa',
            use_cache=False, output_loading_info=True)
        if any(info.values()):
            raise ValueError('模型加载不完整或包含意外权重')
        self.model = loaded.to(self.device).eval()
        self.runtime_info = dict(model=self.identity[0], revision=self.identity[1],
            modelManifestSha256=self.identity[2], device=self.device, dtype=self.dtype,
            torchVersion=torch.__version__, transformersVersion=transformers.__version__,
            batchSize=BATCH_SIZE, maxLength=MAX_LENGTH, attention='sdpa',
            padding='left', truncation=False, useCache=False, logitsToKeep=1,
            numericContract='跨请求缓存和批次组成可能改变数值，不保证与冻结全量 BF16 缓存逐 bit 一致')

    def _infer(self, packed):
        torch = self.torch
        batch = {key: torch.tensor(value, dtype=torch.long, device=self.device)
                 for key, value in left_pad(packed, self.tokenizer.pad_token_id).items()}
        with torch.inference_mode():
            logits = self.model(**batch, use_cache=False, logits_to_keep=1).logits
            if logits.shape[:2] != (len(packed), 1):
                raise ValueError('模型必须只返回最终 token 的 logits')
            yes, no = logits[:, -1, self.yes_id].float(), logits[:, -1, self.no_id].float()
            if not torch.isfinite(yes).all() or not torch.isfinite(no).all():
                raise ValueError('模型返回非有限原始 logits')
            return list(zip(yes.cpu().tolist(), no.cpu().tolist()))

    def score_pairs(self, pairs):
        """输入[(queryAliases,candidateAliases)]，按原顺序返回原始logits。"""
        if not isinstance(pairs, list):
            raise ValueError('标题对必须是列表')
        keys, pending, resolved = [], {}, {}
        for pair in pairs:
            if not isinstance(pair, (list, tuple)) or len(pair) != 2:
                raise ValueError('每个标题对必须包含 queryAliases 和 candidateAliases')
            query, candidate = (tuple(canonical_title_aliases(value)) for value in pair)
            key = self.identity, query, candidate
            keys.append(key)
            if key in self.cache:
                self.cache.move_to_end(key)
                resolved[key] = self.cache[key]
            elif key not in pending:
                parts = prompt_parts(list(query), list(candidate))
                pending[key] = pack_prompt(self.tokenizer, parts, MAX_LENGTH)
        ordered = sorted(pending, key=lambda key: len(pending[key]))
        fresh = {}
        for begin in range(0, len(ordered), BATCH_SIZE):
            selected = ordered[begin:begin + BATCH_SIZE]
            values = self._infer([pending[key] for key in selected])
            if len(values) != len(selected):
                raise ValueError('模型返回的标题对数量不匹配')
            for key, (yes, no) in zip(selected, values):
                if not math.isfinite(yes) or not math.isfinite(no) or not math.isfinite(yes - no):
                    raise ValueError('模型返回非有限原始 logits')
                fresh[key] = dict(yesLogit=yes, noLogit=no, logit=yes - no,
                                  tokenCount=len(pending[key]), truncated=False)
        # 任一批失败都不缓存新结果；缓存容量不限制本次结果的完整返回。
        resolved.update(fresh)
        if self.cache_size:
            for key, result in fresh.items():
                self.cache[key] = result
                while len(self.cache) > self.cache_size:
                    self.cache.popitem(last=False)
        return [dict(resolved[key]) for key in keys]
