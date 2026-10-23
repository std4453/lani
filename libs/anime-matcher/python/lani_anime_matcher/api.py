"""直接Python调用；与v1 worker共享静态模型和输入校验。"""

from .runtime_factory import RuntimeFactory
from .worker import adapt_catalog, adapt_query


class Matcher:
    def __init__(self, catalog, *, semantic=False, model_dir=None,
                 device='cpu', dtype='float32', profile_path=None):
        catalog, _ = adapt_catalog(catalog)
        self._matcher = RuntimeFactory(device=device, dtype=dtype, profile_path=profile_path)(
            catalog, semantic=semantic, model_dir=model_dir
        )

    def match(self, query, candidate_ids):
        """显式传入candidate_ids；空列表拒答，省略参数不会扩大到整个目录。"""
        return self._matcher.match(adapt_query(query), candidate_ids)

    def rank(self, query, candidate_ids):
        """返回caller内实际检索候选的排序，不承诺包含caller的每个条目。"""
        return self._matcher.rank(adapt_query(query), candidate_ids)
