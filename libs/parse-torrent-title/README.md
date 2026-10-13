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

The legacy `subtitle` still contains `hasCHS`, `hasCHT`, `hasJP`, and `type`. Existing language flags are preserved and augmented during migration; ambiguous legacy flags may therefore differ from the stricter `subtitleInfo`. `toLegacySubtitle` remains available as a pure projection of the new structure. 内封 now maps to 内挂 (muxed subtitles). Custom legacy subtitle keywords remain supported independently of the new metadata. The main parser still returns `undefined` if no episode is identified; use `parseSubtitleInfo` directly in that case.

Episode matching covers season/episode markers, bracketed numbers, Chinese episode units, ranges, revisions, and completion labels such as `FIN`, `END`, and 完. Primary numbering is used for dual labels such as `[02(26)]` and `01-12(25-36)`. Adjacent Chinese episode labels such as `01集02集` become a range. Dates, season-only markers, reversed ranges, decimal episodes, and ambiguous non-contiguous packs are deliberately not coerced into a single episode. Legacy group-plus-number releases with an omitted series title remain supported.

This metadata is parsed from release titles at runtime. It does not change the database schema or the generated column used by automatic downloads.

See [CORPUS.md](./CORPUS.md) for replaying a local title corpus against an independently classified baseline and reviewed output changes.
