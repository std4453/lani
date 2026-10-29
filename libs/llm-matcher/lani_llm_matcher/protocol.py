"""轻量协议校验，不读取数据库或逐集目录。"""
import datetime as dt
import json
import math

MAX_BYTES = 16 * 1024 * 1024


class ProtocolError(Exception):
    def __init__(self, code, message, status=400):
        super().__init__(message)
        self.code, self.status = code, status

    def payload(self):
        return {"code": self.code, "message": str(self)}


def invalid(message):
    raise ProtocolError("INVALID_REQUEST", message)


def text(value, name, limit=2048, empty=False):
    if not isinstance(value, str) or len(value) > limit or (not empty and not value):
        invalid(f"{name} 无效")
    try:
        value.encode("utf-8")
    except UnicodeError:
        invalid(f"{name} 不是有效 UTF-8")
    return value


def titles(value, limit):
    if not isinstance(value, list) or len(value) > limit:
        invalid("名称列表无效")
    return [text(v, "名称", empty=True) for v in value]


def integer(value, low, high):
    return value is None or (type(value) is int and low <= value <= high)


def numeric(value):
    return type(value) in (int, float) and math.isfinite(value)


def calendar_date(value):
    if value is None:
        return None
    text(value, "首播日期", 10)
    try:
        if dt.date.fromisoformat(value).isoformat() != value:
            invalid("首播日期必须为 YYYY-MM-DD")
    except ValueError:
        invalid("首播日期无效")
    return value


def catalog_rows(catalog):
    if not isinstance(catalog, list) or len(catalog) > 10000:
        invalid("目录无效或超过 10000 项")
    rows = {}
    for item in catalog:
        if not isinstance(item, dict):
            invalid("目录条目必须是对象")
        sid = text(item.get("id"), "季度 ID", 200)
        if sid in rows:
            invalid("季度 ID 重复")
        aliases = list(dict.fromkeys(a for a in [
            text(item.get("title"), "标题", empty=True),
            *titles(item.get("aliases"), 256),
        ] if a))
        if len(aliases) > 256:
            invalid("名称列表超过 256 项")
        if "year" not in item or not integer(item["year"], 1, 9999):
            invalid("年份无效")
        if "quarter" not in item or not integer(item["quarter"], 1, 4):
            invalid("季度无效")
        count = item.get("declaredEpisodeCount")
        if not integer(count, 1, 2147483647):
            invalid("声明集数无效")
        rows[sid] = dict(id=sid, aliases=aliases, y=item["year"], q=item["quarter"],
                         count=count, premiere=calendar_date(item.get("premiereDate")))
    return rows


def query_input(query):
    if not isinstance(query, dict):
        invalid("query 必须是对象")
    raw = text(query.get("rawTitle"), "原标题", empty=True)
    aliases = [a for a in titles(query.get("aliases"), 32) if a]
    published = text(query.get("publishedAt"), "发布时间")
    try:
        date = dt.datetime.fromisoformat(published.replace("Z", "+00:00"))
        if date.tzinfo is None:
            invalid("发布时间必须包含时区")
    except ValueError:
        invalid("发布时间无效")
    episode, season = query.get("episode"), query.get("publisherSeason")
    if episode is not None and (not numeric(episode) or episode < 0):
        invalid("单集编号无效")
    if not integer(season, 0, 2147483647):
        invalid("发布者季数无效")
    return dict(rawTitle=raw, aliases=aliases, publishedAt=published,
                episode=episode, publisherSeason=season)


def candidate_ids(value, known):
    if not isinstance(value, list) or len(value) > 10000:
        invalid("候选列表无效")
    result = [text(v, "候选 ID", 200) for v in value]
    if len(set(result)) != len(result) or not set(result) <= known:
        invalid("候选 ID 重复或不在目录中")
    return result


def decode(value):
    def nonfinite(_):
        raise ValueError("Invalid JSON constant")
    try:
        return json.loads(value, parse_constant=nonfinite)
    except (ValueError, UnicodeError, RecursionError):
        invalid("JSON 无效")


def encode(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), allow_nan=False)
