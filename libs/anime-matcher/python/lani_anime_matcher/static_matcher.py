"""仅使用完整标题和静态季度信息的匹配器；候选范围始终由调用方决定。"""

import gzip
import hashlib
import json
from pathlib import Path

import numpy as np

from .runtime_common import raw_time14, select_time_columns, time_columns, transform_time14
from .title_features import TitleFeatures


def load_profile(path):
    """权重与输入合同绑定；全开发集重拟合不能冒充独立验证。"""
    path = Path(path)
    profile = json.loads(path.read_text(encoding='utf8'))
    if profile.get('schemaVersion') != 1 or type(profile['schemaVersion']) is not int:
        raise ValueError('不支持此静态模型版本')
    mode, rerankers = profile.get('featureProfile'), profile.get('rerankers')
    if mode not in ('lexical', 'semantic') or not isinstance(rerankers, list):
        raise ValueError('静态模型特征合同无效')
    allowed = ([],) if mode == 'lexical' else (['qwen-0.6b'],)
    if rerankers not in allowed:
        raise ValueError('静态模型的 reranker 顺序无效')
    width = (19 if mode == 'lexical' else 25) + len(rerankers) + len(time_columns(profile.get('head')))
    threshold = profile.get('threshold')
    if type(threshold) not in (int, float) or not 0 <= threshold <= 1:
        raise ValueError('静态模型的拒答阈值无效')
    tree = profile.get('tree', {})
    filename = tree.get('file')
    if (not isinstance(filename, str) or Path(filename).name != filename or
            '/' in filename or '\\' in filename or filename in ('', '.', '..') or
            tree.get('featureCount') != width):
        raise ValueError('静态模型权重路径或维度无效')
    weights = (path.parent / filename).read_bytes()
    if hashlib.sha256(weights).hexdigest() != tree.get('sha256'):
        raise ValueError('静态模型权重校验失败')
    if filename.endswith('.gz'):
        weights = gzip.decompress(weights)
    return profile, weights.decode('utf8')


class StaticMatcher:
    """树负责联合判断，不用日期过滤候选，也不读取逐集元数据。

    scorer 接口：score_pairs([(query_aliases, candidate_aliases), ...]) 返回
    对齐的原始分数记录，logit 字段是 yes-minus-no。注入接口用于重放和测试。
    """

    def __init__(self, catalog, *, profile_path, model_dir=None, scorers=None,
                 features=None, booster=None):
        self.profile, model_text = load_profile(profile_path)
        self.semantic = self.profile['featureProfile'] == 'semantic'
        self.features = features or TitleFeatures(catalog, semantic=self.semantic, model_dir=model_dir)
        self.catalog = self.features.catalog
        self.scorers = dict(scorers or {})
        required = self.profile['rerankers']
        if set(self.scorers) != set(required):
            raise ValueError('必须提供与静态模型合同一致的 reranker')
        if booster is None:
            import lightgbm as lgb
            booster = lgb.Booster(model_str=model_text)
        if booster.num_feature() != self.profile['tree']['featureCount']:
            raise ValueError('权重实际特征维度与合同不符')
        self.booster = booster

    def rank(self, query, candidate_ids):
        """返回caller内检索候选的排序；分数未获得99%精度校准保证。"""
        title, indices, _ = self.features.selected_features(query, candidate_ids)
        if not len(indices):
            return []
        columns = [np.asarray(title, np.float32)]
        pairs = [(query['aliases'], self.catalog[int(j)]['aliases']) for j in indices]
        for name in self.profile['rerankers']:
            records = self.scorers[name].score_pairs(pairs)
            if not isinstance(records, list) or any(not isinstance(r, dict) or 'logit' not in r for r in records):
                raise ValueError('reranker 返回了无效的分数记录')
            values = np.asarray([r['logit'] for r in records], np.float32)
            if values.shape != (len(indices),) or not np.isfinite(values).all():
                raise ValueError('reranker 返回了无效的分数')
            columns.append(values[:, None])
        head = self.profile['head']
        if time_columns(head):
            raw = [raw_time14(query.get('episode'), query.get('publishedAt'), self.catalog[int(j)],
                              self.catalog[int(j)].get('declaredEpisodeCount'), query.get('season'))
                   for j in indices]
            columns.append(np.asarray(select_time_columns(transform_time14(raw), head), np.float32))
        values = np.concatenate(columns, axis=1)
        if values.shape[1] != self.booster.num_feature() or not np.isfinite(values).all():
            raise ValueError('运行特征与静态模型合同不符')
        scores = np.asarray(self.booster.predict(values, num_threads=4), np.float32)
        if (scores.shape != (len(indices),) or not np.isfinite(scores).all() or
                ((scores < 0) | (scores > 1)).any()):
            raise ValueError('静态模型返回了无效的分数')
        order = np.argsort(-scores, kind='stable')
        return [{'seasonId': self.catalog[int(indices[i])]['id'], 'score': float(scores[i])}
                for i in order]

    def match(self, query, candidate_ids):
        ranked = self.rank(query, candidate_ids)
        if not ranked:
            return dict(seasonId=None, reason='no_candidates', score=None)
        best = ranked[0]
        accepted = best['score'] >= self.profile['threshold']
        return dict(seasonId=best['seasonId'] if accepted else None,
                    reason='static_semantic' if accepted and self.semantic else
                           'static_lexical' if accepted else 'low_confidence',
                    score=best['score'])
