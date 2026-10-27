# 弹弹play身份同步

弹幕播放需要单集身份。Bangumi 季度元数据同步查询作品 ID；剧集同步再使用作品 ID 查询分集列表。数据库分别保存作品和单集 ID，不缓存整份请求响应。外部查询超时、失败或没有作品对应时记录日志，保留原映射并继续原有元数据同步。成功切换作品映射时清除旧作品的单集 ID，等待下一次剧集同步重新填写。

API 配置中的 `dandanplay` 选择请求渠道。省略或设为 `false` 时不再查询弹弹play，已有身份继续正常输出到 NFO。启用公开代理：

```yaml
dandanplay:
  kind: publicProxy
```

也可使用[官方签名接口](https://doc.dandanplay.com/open/)，应用凭据只保存在服务端配置中：

```yaml
dandanplay:
  kind: official
  appId: your-app-id
  appSecret: your-app-secret
```

两种配置互斥，公开代理配置拒绝携带应用凭据。两种渠道都使用现有 `network` 全局代理与超时基础配置，并保留本接口10秒超时。官方请求失败不会自动转发到公开代理，日志不记录认证头或原始网络错误对象。密钥不进入 NFO、GraphQL 配置或前端脚本。

普通正片按整数集号匹配，SP 按 Bangumi 返回的出现顺序对应 S1、S2；普通小数集与其他类型留空。重复编号不猜测。该规则适用于当前轻量接入，不用于自动调整下载编号。

季度和单集 NFO 分别写入 `DanmuID=dandan:<作品ID>`、`DanmuID=dandan:<单集ID>`，保留 `lani` 为默认 ID。导入任务和历史媒体刷新共用单集 NFO 生成逻辑。历史刷新在媒体文件操作的串行边界内，根据当前版本的已发布视频定位 NFO，并请求 Jellyfin 重读元数据；有未完成任务时由任务写入最新元数据，避免覆盖发布过程中的文件。

播放端可以直接读取 Jellyfin 的 `ProviderIds`，无需调用 lani。网络失败与缺失映射不会被当作删除指令，NFO 写入成功也不代表 Jellyfin 已完成刷新，验收需要回读单集 `ProviderIds`。
