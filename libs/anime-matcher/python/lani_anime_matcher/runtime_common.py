"""静态季度模型的纯输入合同；不导入训练代码或加载数值库、模型。

新静态profile拒绝负数episode和非法year（日期支持1..9999）；旧v1
适配层尚未采用这些校验。新静态时间profile要求publishedAt，不构造缺失日期；
旧词法接口的可选日期合同不变。候选仍由原Matcher在caller内检索，不在此扩展。
"""

from datetime import date, datetime
import json
import math
from zoneinfo import ZoneInfo

ABSOLUTE_TITLE_COLUMNS = tuple(
    i for i in range(40)
    if i not in (14, 15, 16, 21, 22, 4, 5, 6, 7, 25, 26, 27, 28, 30, 31)
)
TIME_NO_COUNT_COLUMNS = (0, 1, 2, 3, 4, 5, 6, 7, 12, 13)
TIME_WITH_COUNT_COLUMNS = TIME_NO_COUNT_COLUMNS + (8, 9, 10, 11)
TIME_SIGNED_LOG_COLUMNS = (1, 4, 10, 11, 13)
TIME_FLAG_COLUMNS = (0, 3, 8, 12)
IDENTITY_INSTRUCTION = (
    'Given aliases of an anime release query and a catalog subject, determine whether '
    'they refer to the same anime work or installment. Recognize cross-language titles, '
    'translations, transliterations, and abbreviations. Distinguish different works and '
    'explicitly different installments. A missing season or part marker alone does not '
    'establish a different installment.'
)
RELEASE_INSTRUCTION = (
    'Given complete title aliases of an anime release query and a catalog candidate, '
    'judge whether this actual release belongs to that candidate work or installment. '
    'Use any supplied Shanghai publication day, episode index, publisher season, static catalog quarter '
    'and declared episode count jointly with the title text as soft evidence. '
    'Publisher numbering may continue across installments, late uploads may be reposts, '
    'and missing season or part markers alone do not prove a different installment. '
    'A declared episode count is not a hard maximum for publisher numbering. '
    'Do not infer an episode schedule. Answer yes or no.'
)
PREFIX = ('<|im_start|>system\nJudge whether the Document meets the requirements based on '
          'the Query and the Instruct provided. Note that the answer can only be "yes" '
          'or "no".<|im_end|>\n<|im_start|>user\n')
SUFFIX = '<|im_end|>\n<|im_start|>assistant\n<think>\n\n</think>\n\n'


def aliases(value):
    """原样保留全部名称、大小写、标记、重复项和顺序。"""
    if not isinstance(value, list) or not value or any(
        not isinstance(x, str) or not x for x in value
    ):
        raise ValueError('aliases 必须包含完整的非空标题字符串')
    return list(value)


def canonical_title_aliases(value):
    """原始reranker缓存合同：精确去重并按Unicode排序，不清洗字符串。"""
    return sorted(set(aliases(value)))


def _number(value, name, *, integer=False, positive=False):
    if value is None:
        return None
    if type(value) not in ((int,) if integer else (int, float)):
        raise ValueError(f'{name} 必须是有限数字或显式 null')
    try:
        finite = math.isfinite(value)
    except OverflowError:
        finite = False
    if not finite or value < 0 or (positive and value == 0):
        raise ValueError(f'{name} 超出允许范围')
    return value


def _quarter(metadata):
    year, quarter = metadata.get('year'), metadata.get('quarter')
    if year is not None and (type(year) is not int or not 1 <= year <= 9999):
        raise ValueError('静态 year 必须是 1 至 9999 的整数或 null')
    if quarter is not None and (type(quarter) is not int or not 1 <= quarter <= 4):
        raise ValueError('静态 quarter 必须是 1 至 4 的整数或 null')
    return year, quarter


def publication_day(published):
    if published is None:
        return None
    if not isinstance(published, str):
        raise ValueError('publishedAt 必须是带时区的 ISO 8601 字符串')
    try:
        parsed = datetime.fromisoformat(published.replace('Z', '+00:00'))
        if parsed.utcoffset() is None:
            raise ValueError('publishedAt 必须包含时区')
        return parsed.astimezone(ZoneInfo('Asia/Shanghai')).date()
    except (ValueError, OverflowError) as error:
        raise ValueError('publishedAt 必须是有效的带时区 ISO 8601 日期') from error


def absolute_title25(row):
    """投影冻结40列；逐集时间坐标必须是标题专用提取的固定值。"""
    if len(row) != 40 or not all(math.isfinite(x) for x in row):
        raise ValueError('标题特征必须恰好包含 40 个有限数值')
    if list(row[17:21]) != [365., 0., 365., 0.]:
        raise ValueError('标题特征提取必须禁用逐集目录特征')
    return [row[i] for i in ABSOLUTE_TITLE_COLUMNS]


def raw_time14(episode, published_at, metadata, count=None, season=None):
    """只读静态季度与真实上海日期；不使用逐集目录或编号偏移。"""
    episode = _number(episode, 'episode')
    count = _number(count, 'declared count', integer=True, positive=True)
    season = _number(season, 'publisher season', integer=True)
    year, quarter = _quarter(metadata)
    day = publication_day(published_at)
    if day is None:
        raise ValueError('静态时间特征要求提供 publishedAt，不能构造缺失日期')
    known = year is not None and quarter is not None
    age = (day - date(year, quarter * 3 - 2, 1)).days if known else 0
    ep = 0. if episode is None else episode
    result = [float(episode is not None), ep, math.log1p(ep), float(known), age,
              math.copysign(math.log1p(abs(age)), age),
              math.sin(2 * math.pi * (day.month - 1) / 12),
              math.cos(2 * math.pi * (day.month - 1) / 12)]
    result += ([1., math.log1p(count), ep / count if episode is not None else 0.,
                ep - count if episode is not None else 0.] if count is not None else [0.] * 4)
    return result + [float(season is not None), float(season or 0)]


def transform_time14(rows):
    """批量变换保持行独立；已log坐标不再log，返回普通列表。"""
    result = []
    for row in rows:
        if len(row) != 14 or not all(math.isfinite(x) for x in row):
            raise ValueError('静态时间特征必须恰好包含 14 个有限数值')
        if any(row[i] not in (0., 1.) for i in TIME_FLAG_COLUMNS):
            raise ValueError('静态时间特征的缺失标记必须为 0 或 1')
        values = [float(x) for x in row]
        for i in TIME_SIGNED_LOG_COLUMNS:
            values[i] = math.copysign(math.log1p(abs(values[i])), values[i])
        result.append(values)
    return result


def time_columns(head):
    if head == 'titles':
        return ()
    if head == 'time_no_count':
        return TIME_NO_COUNT_COLUMNS
    if head == 'time_with_count':
        return TIME_WITH_COUNT_COLUMNS
    raise ValueError('未知的静态模型 head')


def select_time_columns(rows, head):
    columns = time_columns(head)
    result = []
    for row in rows:
        if len(row) != 14 or not all(math.isfinite(row[i]) for i in columns):
            raise ValueError('选中的时间特征列无效')
        result.append([row[i] for i in columns])
    return result


def input_fields(query_aliases, candidate_aliases, context, metadata, declared_count):
    """联合release输入只含可见事实；不存在ID、标签和检索分数。"""
    day = publication_day(context.get('publishedAt'))
    episode = _number(context.get('episode'), 'episode')
    season = _number(context.get('season'), 'publisher season', integer=True)
    count = _number(declared_count, 'declared count', integer=True, positive=True)
    year, quarter = _quarter(metadata)
    age = ((day - date(year, quarter * 3 - 2, 1)).days
           if day is not None and year is not None and quarter is not None else None)
    return dict(queryAliases=aliases(query_aliases), candidateAliases=aliases(candidate_aliases),
                queryContext=dict(publicationDay=day.isoformat() if day else None,
                                  episodeIndex=episode, publisherSeason=season),
                candidateStatic=dict(year=year, quarter=quarter, declaredEpisodeCount=count),
                derivedTemporal=dict(publicationMinusQuarterStartDays=age,
                    weeklyEpisodeResidualDays=age - 7 * (episode - 1)
                    if age is not None and episode is not None else None))


def model_text(fields, mode='titles_static_time'):
    if mode not in ('titles_only', 'titles_static_time'):
        raise ValueError('未知的输入模式')
    query = dict(aliases=aliases(fields['queryAliases']))
    candidate = dict(aliases=aliases(fields['candidateAliases']))
    if mode == 'titles_static_time':
        if fields['queryContext']['publicationDay'] is None:
            raise ValueError('联合静态时间输入要求提供 publishedAt，不能构造缺失日期')
        query['release'] = {k: fields['queryContext'][k]
                            for k in ('publicationDay', 'episodeIndex', 'publisherSeason')}
        candidate['static'] = {k: fields['candidateStatic'][k]
                               for k in ('year', 'quarter', 'declaredEpisodeCount')}
        candidate['softTemporal'] = {k: fields['derivedTemporal'][k]
            for k in ('publicationMinusQuarterStartDays', 'weeklyEpisodeResidualDays')}
    return tuple(json.dumps(x, ensure_ascii=False, sort_keys=True, separators=(',', ':'))
                 for x in (query, candidate))


def prompt_parts(query_aliases=None, candidate_aliases=None, *, fields=None,
                 mode='titles_static_time'):
    """返回独立编码三段；标题raw排序去重，联合release保留原顺序和重复。"""
    if fields is None:
        query = '\n'.join(canonical_title_aliases(query_aliases))
        document = '\n'.join(canonical_title_aliases(candidate_aliases))
        instruction = IDENTITY_INSTRUCTION
    else:
        if query_aliases is not None or candidate_aliases is not None:
            raise ValueError('aliases 与联合 release fields 不能同时提供')
        query, document = model_text(fields, mode)
        instruction = RELEASE_INSTRUCTION
    body = f'<Instruct>: {instruction}\n<Query>: {query}\n<Document>: {document}'
    return PREFIX, body, SUFFIX


def pack_prompt(tokenizer, parts, max_length):
    """禁止静默截断完整别名；调用方决定固定token预算。"""
    if type(max_length) is not int or max_length < 1 or len(parts) != 3:
        raise ValueError('必须提供正整数 token 预算和三段提示文本')
    ids = []
    for part in parts:
        value = tokenizer.encode(part, add_special_tokens=False)
        ids.extend(value if isinstance(value, list) else value.ids)
    if not ids:
        raise ValueError('完整提示必须包含 token')
    if len(ids) > max_length:
        raise ValueError(f'提示包含 {len(ids)} 个 token，超过 max_length={max_length}；请提高固定上下文上限，不能截断 aliases')
    return ids
