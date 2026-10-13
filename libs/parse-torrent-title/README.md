# `@lani/parse-torrent-title`

`parseTorrentTitle` parses release titles and keeps the existing `subtitle` fields for compatibility. `parseSubtitleInfo` can also be called on its own, including for movie titles that have no episode number.

`subtitleInfo` reports explicit subtitle metadata:

- `languages` contains BCP 47 language tags when the title identifies a language, such as `zh-Hans`, `zh-Hant`, `ja`, or `en`.
- `multi` is true for an explicit multi-subtitle label or two or more identified language tags; false does not guarantee a single subtitle track. A `Multi-Sub` label does not identify or imply any particular language.
- `delivery` may contain `burned-in`, `muxed`, or `external` when the title identifies subtitle delivery.

An undefined `subtitleInfo` means the title does not provide enough information. `null` means it explicitly says that subtitles are absent, for example `[No Subs]` or `[无字幕]`. When serialized as JSON, undefined properties are omitted while `null` is retained.

For example, `[简繁日内封]` adds:

```json
{
  "subtitleInfo": {
    "languages": ["zh-Hans", "zh-Hant", "ja"],
    "multi": true,
    "delivery": ["muxed"]
  }
}
```

The legacy `subtitle` still contains `hasCHS`, `hasCHT`, `hasJP`, and `type`. Existing language flags are preserved and augmented during migration; ambiguous legacy flags may therefore differ from the stricter `subtitleInfo`. `toLegacySubtitle` remains available as a pure projection of the new structure. 内封 now maps to 内挂 (muxed subtitles). Custom legacy subtitle keywords remain supported independently of the new metadata. The main parser returns `undefined` if neither an episode nor an explicit special-release marker is identified; use `parseSubtitleInfo` directly in that case.

Episode matching covers season/episode markers, padded `E01`, bracketed numbers, Chinese episode units, ranges, revisions, and completion labels such as `FIN`, `END`, and 完. Primary numbering is used for dual labels such as `[02(26)]`, `[01 - 总第11]`, and `01-12(25-36)`. Short annotations such as `★12(完)★` are supported. Hyphenated revisions accept `-v1` through `-v9`; existing `vN` and `_vN` notation remains supported. Multi-part version strings are not treated as episode numbers.

`episodeInfo` separates ordinary episode numbering from explicitly marked specials:

```json
{ "index": 12.5, "episodeInfo": { "type": "episode", "index": 12.5 } }
```

```json
{ "episodeInfo": { "type": "sp", "index": 1 } }
```

The types are `episode`, `sp`, `ova`, and `oad`. `SP01` produces the second example; a bare `SP` produces `{ "episodeInfo": { "type": "sp" } }`. Missing numbers are omitted, never inferred as zero. Special numbering is kept out of the legacy `index` field, so consumers cannot accidentally interpret `SP1` as ordinary episode 1. Ordinary episodes retain their existing `index` and range shape. A separately identified ordinary range in a mixed pack such as `[01-12+SP]` remains an ordinary range; this is not a complete inventory of the pack's extras.

Single episodes and range endpoints preserve `.5` exactly; unsupported decimal suffixes and split-file labels such as `26.5 Part 1` are not truncated. Dates, season-only markers, reversed ranges, and ambiguous non-contiguous packs are not coerced into an ordinary episode. These are release-title labels, not a mapping to Bangumi's `type`, `sort`, or `ep` fields.

No database schema is changed. The API persistence adapter clears all three legacy integer index columns for fractional indices and special releases, while retaining other parsed metadata. It does not round decimals or store special numbers as ordinary episode numbers. Supporting those releases in automatic downloads still requires a corresponding database and metadata-provider mapping.

See [CORPUS.md](./CORPUS.md) for replaying a local title corpus against an independently classified baseline and reviewed output changes.
