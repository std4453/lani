# prisma.schema

`Torrent.episodeIndex` 的生成代码如下：

```sql
alter table torrents drop column if exists episode_index;
alter table torrents add column episode_index integer
generated always as (
  cast(
    substring(
      title from '(((?<=-\s)\d{1,3}(?=\s))|((?<=\[)\d{1,3}(?=((\sEND)|(v\d+))?\]))|(?<=\u7b2c)\d{1,3}(?=\u96c6)|(?<=\u3010)\d{1,3}(?=\u3011))'
    ) as integer
  )
) stored;
```