"""可追溯的文本归一化；不补充外部作品别名。"""

import re
import unicodedata
from functools import lru_cache
from opencc import OpenCC

_CC = OpenCC("t2s")
_SEASON = r"第[一二三四五六七八九十0-9]+[季期部分篇]|\bseason\s*\d+|\b\d+(?:st|nd|rd|th)\s*season|\bs\d{1,2}\b|\bpart\s*\d+"


@lru_cache(maxsize=32768)
def norm(s):
    return "".join(
        c for c in unicodedata.normalize("NFKC", _CC.convert(s)).lower() if c.isalnum()
    )


def han(s):
    return (
        norm("".join(re.findall("[\u3400-\u9fff]+", s)))
        if not re.search("[\u3040-\u30ff]", s)
        else ""
    )


def latin(s):
    return " ".join(re.findall("[a-zA-Z]+", s.lower()))


def phonetic(s, kakasi):
    s = re.sub(_SEASON, "", unicodedata.normalize("NFKC", s).lower())
    if re.search("[\u3040-\u30ff]", s):
        s = " ".join(w["hepburn"] for w in kakasi.convert(s))
    elif re.search("[\u3400-\u9fff\uac00-\ud7a3]", s) and not re.search("[a-zA-Z]", s):
        return ""
    s = "".join(c for c in unicodedata.normalize("NFKD", s).lower() if "a" <= c <= "z")
    for a, b in [("ou", "o"), ("oo", "o"), ("uu", "u"), ("l", "r")]:
        s = s.replace(a, b)
    return s if len(s) >= 4 else ""
