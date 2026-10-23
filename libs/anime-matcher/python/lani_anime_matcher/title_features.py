"""静态季度模型的标题特征与caller内检索；不加载旧树或身份后备策略。

完整目录决定TF-IDF；查询别名保留顺序和重复。仅19/25绝对列可用于模型，
其余40列坐标是兼容占位，不能用于旧模型。词法模式不加载任何神经依赖。
"""

import collections

import numpy as np
from rapidfuzz import fuzz, process
from sklearn.feature_extraction.text import TfidfVectorizer

from .runtime_common import ABSOLUTE_TITLE_COLUMNS
from .text import norm, han, latin, phonetic

LEXICAL_TITLE_COLUMNS = tuple(i for i in ABSOLUTE_TITLE_COLUMNS if i not in (3, 29, 36, 37, 38, 39))


def _strings(value, limit):
    if (not isinstance(value, list) or len(value) > limit or
            any(not isinstance(x, str) or len(x) > 2048 for x in value)):
        raise ValueError('标题列表无效或过长')
    return list(value)


class E5Encoder:
    """仅E5-base，固定batch=1的CPU ONNX编码与冻结实现一致。"""

    def __init__(self, model_dir=None):
        import onnxruntime as ort
        from tokenizers import Tokenizer
        from .models import verify

        root = verify(model_dir, 'e5-base')
        options = ort.SessionOptions()
        options.intra_op_num_threads = 4
        options.inter_op_num_threads = 1
        options.log_severity_level = 3
        self.session = ort.InferenceSession(
            str(root / 'model_qint8_avx512_vnni.onnx'), options,
            providers=['CPUExecutionProvider'],
        )
        self.tokenizer = Tokenizer.from_file(str(root / 'tokenizer.json'))
        self.tokenizer.enable_truncation(max_length=512)
        self.names = {x.name for x in self.session.get_inputs()}
        self.output = self.session.get_outputs()[0].name
        self.cache = collections.OrderedDict()

    def embed(self, text):
        if text in self.cache:
            self.cache.move_to_end(text)
            return self.cache[text]
        # 固定 batch=1；动态 int8 量化的批次效应会改变边界分数。
        enc = self.tokenizer.encode("query: " + text)
        mask = np.array([enc.attention_mask], np.int64)
        feed = {"input_ids": np.array([enc.ids], np.int64), "attention_mask": mask}
        if "token_type_ids" in self.names:
            feed["token_type_ids"] = np.array([enc.type_ids], np.int64)
        hidden = self.session.run([self.output], feed)[0]
        pooled = (hidden * mask[:, :, None]).sum(axis=1) / np.maximum(
            mask.sum(axis=1, keepdims=True), 1
        )
        vector = (
            pooled / np.maximum(np.linalg.norm(pooled, axis=1, keepdims=True), 1e-12)
        ).astype(np.float32)[0]
        self.cache[text] = vector
        if len(self.cache) > 16384:
            self.cache.popitem(last=False)
        return vector


class TitleFeatures:
    def __init__(self, catalog, *, semantic=False, model_dir=None, encoder=None, romanizer=None):
        if not isinstance(catalog, list) or len(catalog) > 10000:
            raise ValueError('季度目录必须是最多 10000 项的列表')
        self.catalog, self.ids = [], {}
        for item in catalog:
            if not isinstance(item, dict):
                raise ValueError('季度条目必须是对象')
            sid = item.get('id')
            if not isinstance(sid, str) or not sid or len(sid) > 200 or sid in self.ids:
                raise ValueError('季度 ID 必须是唯一的非空字符串')
            self.ids[sid] = len(self.catalog)
            # 静态元数据保留给下游；特征不读取逐集目录。
            self.catalog.append({**item, 'aliases': _strings(item.get('aliases'), 256)})
        self.semantic = bool(semantic)
        if not self.semantic and (encoder is not None or romanizer is not None):
            raise ValueError('词法模式不能注入语义编码器或读音转换器')
        self.feature_profile = 'consensus-v1'
        self.texts = list(dict.fromkeys(a for s in self.catalog for a in s['aliases']))
        cm = {a: i for i, a in enumerate(self.texts)}
        self.owners = [np.array([cm[a] for a in s['aliases']], dtype=int) for s in self.catalog]
        self.transforms = {name: [extract(a) for a in self.texts]
                           for name, extract in [('ratio', norm), ('weighted', norm), ('han', han), ('latin', latin)]}
        self.tfidf = {}
        for name, extract, options in [
            ('gram', norm, {'analyzer': 'char', 'ngram_range': (2, 4), 'sublinear_tf': True}),
            ('word', latin, {'token_pattern': r'(?u)\b\w+\b'}),
        ]:
            tf = TfidfVectorizer(dtype=np.float32, **options)
            try:
                mat = tf.fit_transform([extract(a) for a in self.texts])
            except ValueError:
                continue
            self.tfidf[name] = (tf, mat, extract)
        self.cache = collections.OrderedDict()
        self.encoder, self.romanizer = None, None
        if self.semantic:
            self.encoder = encoder if encoder is not None else E5Encoder(model_dir)
            if romanizer is None:
                from pykakasi import kakasi
                romanizer = kakasi()
            self.romanizer = romanizer
            self.vectors = np.array([self.encoder.embed(t) for t in self.texts], np.float32)
            # 读音softfeature兼容旧转换；raw reranker仍接收完整原始字符串。
            self.phonetics = [phonetic(t, romanizer) for t in self.texts]

    def reduce(self, matrix):
        result = np.zeros(len(self.catalog), dtype=np.float32)
        if len(matrix):
            for i, cols in enumerate(self.owners):
                if len(cols):
                    result[i] = matrix[:, cols].max()
        return result

    def alias_consensus(self, matrix, aliases):
        """先对每个 query 别名取候选最佳分数，再计算四项跨别名聚合。"""
        result = np.zeros((len(self.catalog), 4), dtype=np.float32)
        if not aliases:
            return result
        weights = np.array([len(norm(a)) for a in aliases], dtype=np.float32)
        if not weights.any():
            weights = np.ones(len(aliases), dtype=np.float32)
        for j, cols in enumerate(self.owners):
            if not len(cols):
                continue
            best = matrix[:, cols].max(axis=1)
            mean = best.mean()
            result[j] = [
                mean,
                best.min(),
                best.max() - mean,
                np.average(best, weights=weights),
            ]
        return result

    def prepare(self, aliases):
        aliases = _strings(aliases, 32)
        key = tuple(aliases)
        if key in self.cache:
            self.cache.move_to_end(key)
            return self.cache[key]
        f = {}
        for n, extract, scorer in [
            ("ratio", norm, fuzz.ratio),
            ("weighted", norm, fuzz.WRatio),
            ("han", han, fuzz.ratio),
            ("latin", latin, fuzz.ratio),
        ]:
            aa = [extract(a) for a in aliases]
            bb = self.transforms[n]
            matrix = (
                process.cdist(aa, bb, scorer=scorer, dtype=np.float32, workers=1) / 100
            )
            if len(bb):
                matrix[:, np.array([not b for b in bb])] = 0
            if aa:
                matrix[np.array([not a for a in aa])] = 0
            f[n] = self.reduce(matrix)
            if n == "ratio" and self.feature_profile == "consensus-v1":
                f["ratio_consensus"] = self.alias_consensus(matrix, aliases)
        for name in ["gram", "word"]:
            if aliases and name in self.tfidf:
                tf, mat, extract = self.tfidf[name]
                f[name] = self.reduce(
                    (tf.transform([extract(a) for a in aliases]) @ mat.T).toarray()
                )
            else:
                f[name] = np.zeros(len(self.catalog), dtype=np.float32)
        f["has_han"] = any(han(a) for a in aliases)
        f["has_latin"] = any(latin(a) for a in aliases)
        f["e5"] = np.zeros(len(self.catalog), dtype=np.float32)
        if self.feature_profile == "consensus-v1":
            f["e5_consensus"] = np.zeros((len(self.catalog), 4), dtype=np.float32)
        if self.semantic:
            self._prepare_semantic(aliases, f)
        self.cache[key] = f
        if len(self.cache) > 2048:
            self.cache.popitem(last=False)
        return f

    def _prepare_semantic(self, aliases, f):
        if aliases and self.texts:
            vectors = np.array([self.encoder.embed(a) for a in aliases])
            scores = vectors @ self.vectors.T
            f['e5_consensus'] = self.alias_consensus(scores, aliases)
            f['e5'] = np.full(len(self.catalog), -1, np.float32)
            for j, cols in enumerate(self.owners):
                if len(cols):
                    f['e5'][j] = scores[:, cols].max()
        pp = [phonetic(a, self.romanizer) for a in aliases]
        matrix = process.cdist(pp, self.phonetics, scorer=fuzz.ratio, dtype=np.float32, workers=1) / 100
        if self.phonetics:
            matrix[:, np.array([not a for a in self.phonetics])] = 0
        if pp:
            matrix[np.array([not a for a in pp])] = 0
        f['phonetic'] = self.reduce(matrix)

    def features(self, query, candidate_ids, *, prepared=None):
        """返回原40坐标、检索到的catalog索引、缓存；只保证19/25绝对列。"""
        if not isinstance(query, dict):
            raise ValueError('查询必须是对象')
        aliases = _strings(query.get('aliases'), 32)
        if (not isinstance(candidate_ids, list) or
                any(not isinstance(s, str) or s not in self.ids for s in candidate_ids) or
                len(set(candidate_ids)) != len(candidate_ids)):
            raise ValueError('候选 ID 不存在或重复')
        cc = np.array(sorted(self.ids[s] for s in candidate_ids), dtype=int)
        cc = np.array([j for j in cc if self.catalog[j]['aliases'] and aliases], dtype=int)
        if not len(cc):
            return np.empty((0, 40), np.float32), cc, None
        f = prepared if prepared is not None else self.prepare(aliases)
        methods = [('ratio', 10), ('gram', 10)] + ([('e5', 5), ('phonetic', 10)] if self.semantic else [])
        chosen = set()
        for name, k in methods:
            order = np.argsort(-f[name][cc], kind='stable')
            chosen.update(cc[order[:k]].tolist())
        candidates = np.array(sorted(chosen), dtype=int)
        rows = []
        for j in candidates:
            values = np.zeros(40, np.float32)
            values[:4] = [float(f[n][j]) for n in ('ratio', 'weighted', 'gram', 'e5')]
            h, l = float(f['han'][j]), float(f['latin'][j])
            hh, hl = f['has_han'], f['has_latin']
            values[8:14] = [h, l, float(f['word'][j]), hh, hl,
                             min(h, l) if hh and hl else max(h, l)]
            values[17:21] = [365., 0., 365., 0.]
            values[23:25] = [min(len(' '.join(aliases)), 200), len(aliases)]
            values[32:36] = f['ratio_consensus'][j]
            values[36:40] = f['e5_consensus'][j]
            if self.semantic:
                values[29] = f['phonetic'][j]
            rows.append(values)
        return np.asarray(rows, np.float32), candidates, f

    def selected_features(self, query, candidate_ids):
        values, candidates, prepared = self.features(query, candidate_ids)
        columns = ABSOLUTE_TITLE_COLUMNS if self.semantic else LEXICAL_TITLE_COLUMNS
        return values[:, columns], candidates, prepared
