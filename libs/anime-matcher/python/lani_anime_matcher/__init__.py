"""季度候选由调用方提供；协议状态查询不加载推理依赖。"""

__all__ = ["Matcher"]


def __getattr__(name):
    if name == "Matcher":
        from .api import Matcher

        return Matcher
    raise AttributeError(name)
