"""按需建立运行模型；目录刷新复用编码器，status不加载数值库。"""

import hashlib
from pathlib import Path


class RuntimeFactory:
    def __init__(self, *, device='cpu', dtype='float32', profile_path=None):
        if device not in ('cpu', 'cuda') or dtype not in ('float32', 'bfloat16', 'float16'):
            raise ValueError('运行设备或精度无效')
        if device == 'cpu' and dtype != 'float32':
            raise ValueError('CPU 推理要求 float32')
        self.device, self.dtype = device, dtype
        self.profile_path = Path(profile_path) if profile_path is not None else None
        self.encoder = None
        self.romanizer = None
        self.scorers = None
        self.model_root = None

    def __call__(self, catalog, *, semantic=False, model_dir=None):
        from .models import model_root, MANIFEST
        from .static_matcher import StaticMatcher, load_profile
        from .title_features import TitleFeatures, E5Encoder

        assets = Path(__file__).parent / 'assets'
        profile_path = self.profile_path or assets / ('static-semantic.manifest.json' if semantic else 'static-lexical.manifest.json')
        profile, _ = load_profile(profile_path)
        if (profile['featureProfile'] == 'semantic') != semantic:
            raise ValueError('模型特征合同与语义开关不一致')
        if not semantic:
            return StaticMatcher(catalog, profile_path=profile_path)
        root = model_root(model_dir).resolve()
        if self.model_root is not None and self.model_root != root:
            raise ValueError('同一 worker 的模型目录不能在运行中变更')
        if self.encoder is None:
            from pykakasi import kakasi
            self.encoder = E5Encoder(root)
            self.romanizer = kakasi()
            self.model_root = root
        if self.scorers is None:
            from .raw_qwen import RawQwenScorer
            scorers = {}
            for name in profile['rerankers']:
                spec = MANIFEST[name]
                manifest_file = assets / spec['manifestAsset']
                expected = hashlib.sha256(manifest_file.read_bytes()).hexdigest()
                if expected != spec['manifestSha256']:
                    raise ValueError('发布包中的语义模型清单校验失败')
                scorers[name] = RawQwenScorer(root / name, model=name.removeprefix('qwen-'),
                                             expected_manifest_sha256=expected,
                                             device=self.device, dtype=self.dtype)
            self.scorers = scorers
        if set(self.scorers) != set(profile['rerankers']):
            raise ValueError('运行中的模型规格已变更，请重启 worker')
        features = TitleFeatures(catalog, semantic=True, encoder=self.encoder, romanizer=self.romanizer)
        return StaticMatcher(catalog, profile_path=profile_path, features=features, scorers=self.scorers)
