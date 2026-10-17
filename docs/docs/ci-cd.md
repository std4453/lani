# CI/CD

本文说明公开仓库的构建、检查与部署通知协议。部署模板、环境参数和访问凭据由独立私有部署仓库维护，不是本地开发的前置条件。

## 独立测试

构建、manifest 检查与独立测试 workflow 均使用 Node.js 22。`test.yaml` 在目标为 `next` 的 PR、`next` push 和手动触发时执行 workflow、解析器、API、Gateway、Admin 的单元测试，以及使用一次性 PostgreSQL 14 service 的数据库集成测试；不打包或发布镜像，也不执行 e2e。`[skip-cd]` 不影响测试。本机对应命令见[开发指南](development.md#单元测试)。

## 镜像构建

`default_pipeline.yaml` 为 `next` push 和同仓库、目标为 `next` 的 PR 构建完整的已提交 manifest。PR 使用 head SHA，只构建缺失的 fingerprint 镜像；全部镜像复用时仍发送部署通知。未合并的 fork PR 仅执行独立的 manifest 检查和测试，不通过此流程发布镜像。

后端、all-in-one 和 Prisma 迁移镜像使用 `node:22-bullseye-slim`。Prisma 3.15.2 的 Linux 引擎链接系统 OpenSSL，Bullseye 使用 `debian-openssl-1.1.x`；不要根据 Node 自带的 OpenSSL 3.x 修改该目标。API 和迁移镜像显式安装 OpenSSL 与 CA 证书，迁移镜像在构建时准备引擎。Bullseye 已归档，需要安装系统包的镜像使用 Debian 官方归档源，保留软件包签名验证。

all-in-one 的 MinIO 官方二进制下载地址已失效，改为在独立 Go 构建阶段编译固定的上游发布版本 `RELEASE.2025-10-15T17-29-55Z`，然后复制静态二进制到 Bullseye 运行镜像；构建时需要访问 Go 模块源。

## 自动部署通知

同仓库、目标为 `next` 的未合并 PR 默认在构建完成后通知测试部署。通知要求 PR 仍打开、作者为仓库所有者或拥有 write/maintain/admin 权限，且当前 head SHA 未改变。

如果当前 head 提交的完整消息或最新 PR 标题含大小写敏感的 `[skip-cd]`，自动 PR 通知会成功跳过，并在 workflow 摘要中说明原因。提交标记只作用于该 head，标题标记持续有效，直到移除。它们不跳过构建、manifest 校验、镜像准备或测试。仅编辑标题不会触发部署；下一次提交或 **Re-run all jobs** 才会重新检查最新标题和 head，已经发出的通知不会被取消。

`next` push 始终通知 online。流程查询与该 SHA 精确关联的 PR：只有恰好一个已合并 PR 属于本仓库、目标为 `next` 且 merge SHA 等于该 push SHA 时，才额外通知 offline/next 并携带 `mergedPr`；匹配不唯一时失败，不猜测目标。直接 push 只通知 online。构建只执行一次，online 与 offline 通知独立执行。已合并的 fork PR 同样适用，此时提交已经进入受信的 `next` 历史，并经过祖先关系校验。

跳过标记仅影响合并前的自动 PR 通知；`next` push 不扫描合并提交消息中的标记。`scope:ui` 选择共享测试环境的数据准备策略，不限制目标 manifest 的镜像部署范围。

## 手动触发

手动运行时选择 `environment` 与 `ref`（`next` 或 `pr/<number>`）。`sourceSha` 可指定 `next` 历史中的提交；PR 使用当前 head。手动 dispatch 是明确的部署请求，忽略两种跳过标记，但仍检查作者权限、PR 是否符合条件以及当前 head。online 仅接受 `next`。

CLI 支持 `--environment` 和 `--ref`，部署始终对齐完整 manifest。`--no-cd` 使用独立的单应用构建流程（`app` 输入）；all-in-one workflow 的构建目标固定。

## 通知与结果

通知 job 仅读取 GitHub 元数据，不检出候选代码。通知发送 `sourceSha`、`ref`、`environment` 和 `automatic`，只有合并 PR 的通知附带 `mergedPr`。通知凭据、Environment 访问规则及测试基线初始化由私有部署指南维护。

构建或通知成功不代表部署成功，还需检查部署仓库的发布结果。通知失败时可完整重跑 workflow，已有 fingerprint 镜像会复用。

向 `next` 合入前要求分支 up to date，最终使用 squash/rebase merge 保持线性历史；同步工作分支允许 merge 或 rebase。提交、hook 和 manifest 规则见[贡献指南](https://github.com/std4453/lani/blob/next/CONTRIBUTING.md)。
