# 构建指纹的设计

manifest 描述源码构建输入，供 CI 复用镜像和部署端比较版本。生成器读取 Git 暂存区或完整提交，因此结果与本机依赖安装、构建缓存和网络无关。提交操作见[贡献指南](../../CONTRIBUTING.md#提交与检查)。

## 输入范围

Node 应用从自身项目及 Rush 依赖闭包中收集文件，包含部署额外声明的项目。Rush 配置用于发现项目和依赖关系，文件本身不参与哈希。跨包源码和符号链接目标必须声明依赖，才能让变化传递到消费者。

镜像使用的 Dockerfile、Docker 上下文规则、应用源码、运行资源、包配置和编译配置参与指纹。依赖包的 Dockerfile 仅影响该依赖包自己的镜像。`package.json`、Prisma schema 等文件按原文整体参与，不拆字段或规范化 JSON；Prisma schema 中的生成目标也随文件一起计入。

`anime-matcher` 的 Python 镜像直接从包目录构建，只收集该目录中的文件，不带入 Rush 依赖闭包、pnpm 依赖或仓库根目录的 Docker 上下文规则。同包的 TypeScript 客户端通过镜像专属 ignore 规则排除。Python 依赖声明、安装脚本和模型清单保留；Python 尚无传递依赖锁文件，指纹只能证明已提交输入相同，不能证明重新下载的依赖与过去完全一致。

外部大模型匹配器内置于 API，其源码与提示词属于 API 镜像输入；提示词由 Nest assets 复制到运行目录。

## 文件排除规则

[根目录 `.fingerprintignore`](../../.fingerprintignore) 使用 gitignore 语法，排除文档、测试、夹具、样例、编辑器配置和通用构建工具等文件。镜像如有特殊需求，在 `common/config/fingerprints/<镜像名>.ignore` 中追加规则。两者的路径均相对于仓库根目录，区分大小写；镜像规则后生效。

支持 `*`、`**`、目录规则、注释和 `!` 反选。被排除的父目录必须先恢复，才能恢复其中的文件。例如：

```gitignore
/apps/admin/samples/
!/apps/admin/samples/
/apps/admin/samples/*
!/apps/admin/samples/runtime.json
```

规则只筛选已收集的项目文件，不能用反选引入依赖闭包之外的文件。ignore 文件本身不参与哈希：修改注释或不命中任何文件的规则不会导致重建，实际输入集合改变才会改变指纹。新增目录、依赖或规则时，用 `explain` 核对 `inputs` 和 `excluded`；被规则排除的文件会显示规则来源、行号和原文。

语法匹配使用固定版本的 [ignore](https://github.com/kaelzhang/node-ignore) 库。为支持安装依赖前的 Git hook 和 CI 检查，库源码及许可证随脚本保存，版本与更新方法见 [vendor 说明](vendor/ignore/README.md)。

CI workflows、Node/Rush 工具版本、构建钩子和通用构建脚本不直接参与应用指纹。这是维护策略上的取舍：若仅修改这些基础设施并确实需要重建，应显式更新对应镜像的构建输入。Dockerfile 等镜像环境文件仍保留在输入中。

## 锁文件与发布

算法 v3 保留按应用截取 pnpm 9 锁文件的机制：只纳入对应 importer，以及递归可达的 package 和 snapshot，包含开发依赖、可选依赖及 peer 实例。全局 overrides、安装设置和 pnpmfile 校验和不直接参与哈希；它们造成的实际依赖解析变化通过所选记录体现。无关项目的依赖或 override 变化不会让所有镜像失效。

算法版本升级会一次性改变全部指纹。后续指纹由有效输入决定，生成器和 ignore 库自身的文件变化不直接触发重建；调整算法语义时应评估是否需要升级版本。

CI 仅构建缺失的 `fp-<fingerprint>` 镜像，并以 OCI labels 记录实际构建 SHA、指纹及 run/attempt。标签用于追溯，可信度仍依赖发布权限。保留已发布指纹标签；需要更新基础镜像等外部输入时，修改 Dockerfile 等对应输入产生新指纹。完整重跑会重新规划，避免单独重跑旧 job 覆盖既有产物。
