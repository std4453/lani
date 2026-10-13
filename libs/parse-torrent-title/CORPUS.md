# Corpus gate

After building the package, run the replay gate with three local NDJSON files:

```sh
node scripts/check-corpus.cjs /path/to/baseline.ndjson /path/to/eligibility.ndjson /path/to/reviewed-changes.ndjson
```

Run from `libs/parse-torrent-title`. The baseline has one `{ "id", "title", "parsed" }` row per input title; `parsed` is the prior parser result or `null`. Eligibility has the same IDs and titles plus a frozen boolean `eligible`. The reviewed-changes file contains one record per approved difference:

```json
{
  "id": "example",
  "title": "[Group] Series S01E03",
  "path": "index",
  "old": 2,
  "new": 3,
  "reason": "Verified season and episode mapping",
  "status": "accepted"
}
```

The gate checks title, organization, index, source, format, and legacy subtitle output. Existing source and format keys must retain their values; newly recognized keys are allowed. Legacy subtitle booleans only flag loss of `true`, while type changes and other legacy subtitle values require review. A new parser result after an old parse failure, or a lost result, is reviewed through its exact `index` change; a lost result must explicitly use `new: null`. Reviews must match the current ID, title, path, old value, and new value exactly, and include a reason. Missing, stale, duplicate, or inexact reviews fail the gate.

Eligibility must match the baseline IDs and titles one-to-one. The eligible parse-failure rate must be below 3%; parser exceptions always fail. The report prints SHA-256 hashes for all inputs and the package `dist` directory. Keep corpus and review files outside the repository.

Eligibility must be established independently of parser success: do not remove a title just because the new parser cannot handle it. Keep uncertain numeric candidates in the denominator. Exclusions need evidence that no episode identifier is present (for example, only technical metadata or explicitly delimited calendar years). Keep the classification rules and exclusion evidence with the local corpus so that a percentage can be reproduced and audited.

A passing gate checks this corpus against its reviewed baseline; it is not a claim of accuracy on unseen titles. In particular, accepted changes need semantic review: parser output alone does not prove that a number is an episode.

An optional fourth argument supplies independently reviewed expected indices:

```sh
node scripts/check-corpus.cjs baseline.ndjson eligibility.ndjson reviewed-changes.ndjson expected-indices.ndjson
```

Each label contains `id`, the exact `title`, `index` (a number, range, or `null` when no ordinary index should be returned), and a nonempty `reason`. Unlike a baseline comparison, this check detects an unchanged wrong answer. Duplicate labels, unknown IDs, title mismatches, incorrect successful indices, and missed expected indices fail the gate. The report states the number of labeled rows; it is not a full-corpus accuracy estimate unless every row has an independent label. Known failures outside a change's scope should remain in a separate audit report, not be relabeled to match the parser.

An unnumbered special can return useful `episodeInfo` while still counting as an eligible index failure. A numbered special can recover a typed index, but it does not recover the ordinary legacy `index`. Special metadata changes require exact review; newly added ordinary `episodeInfo` merely duplicates the existing index contract. The expected-index labels validate the legacy index, including its absence for specials; special type and number semantics are also covered by unit tests.
