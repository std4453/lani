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

主要匹配常见的种子标题pattern：
- [喵萌奶茶屋&LoliHouse] 少女前线 / Dolls’ Frontline / Girls’ Frontline - **12** [WebRip 1080p HEVC-10bit AAC][简繁日内封字幕]
- [离谱Sub] 派对浪客诸葛孔明 / パリピ孔明 / Paripi Koumei [**01**][HEVC AAC][1080p][简繁内封]
- 【极影字幕社】★ 东京24区 第**10**集 BIG5 AVC 720p MP4
- 【幻樱字幕组】【1月新番】【佐佐木与宫野 Sasaki to Miyano】【**12**】【GB_MP4】【1280X720】

注意不能匹配到：
- 分辨率：[1080p]、1920x1080
- 季度：S2、S02
- 月份：【01月新番】
- 其他地方出现的“-”
- 合集：01-12

此外特判了部分特别情形：
- [12 END]
- [01v2]

另外，这里故意将集数限制在1~3个数字，希望能防止碰到[1080]这种结构，考虑到季番一般没有这么多集。

根据人眼观察，该表达式基本上是可靠的，总是能选出正确的结果。

最后列出一些已知会导致问题的情形：
- [猎户随缘发布组] 银河英雄传说：全新命题 激战 Legend of the Galactic Heroes: Die Neue These - Collision [03( 27) ] [1080p] [GB] [网盘] [2022年4月番]
- [s5291s][搬运]【派对咖孔明】第1话 孔明 降临于涩谷[1080P]【简繁】
- [国漫]万界仙踪_1920x1080_万界仙踪_258集
