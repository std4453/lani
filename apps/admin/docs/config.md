# 配置

应用会请求 `/config.json` 获取当前配置，格式如下：

```json
{
  "auth": {
    "enabled": true,
    "provider": "keycloak",
    "keycloak": {
      "url": "https://keycloak-url",
      "realm": "my-realm",
      "clientId": "my-client-id",
      "role": "my-role"
    },
    "jellyfin": {
      "host": "https://my-jellyfin-host",
      "serverId": "my-jellyfin-server-id"
    }
  }
}
```

这里暂时只支持 [Keycloak](https://www.keycloak.org/) 作为 OAuth Provider。

如果以其他基于 Cookie 的方式（比如 Session 或 `oauth2-proxy`）鉴权，则可以关闭 `auth`：

```json
{
  "auth": {
    "enabled": false
  },
  "jellyfin": {
    // ...
  }
}
```

注意该文件必须放在服务器根目录，由于可能动态更改，打包的 Docker 镜像中并不含有此文件，实际部署时应当 mount 到文件目录下

---

开发时需要在 `public` 中添加 `config.json`，此文件已被 git ignore，内容格式同上。
