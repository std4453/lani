# 动画季度匹配器

将一条单集种子的完整解析标题／别名、发布时间和 `episodeIndex` 匹配到**调用方明确传入的候选动画**，返回 top-1 或拒答。提供独立 Python worker、v1 HTTP／JSONL 协议、Node.js 客户端和最终效果报告。

目录输入使用数据库标题与完整 Bangumi 别名，不依赖逐集发布日期或逐集元数据。匹配器不访问数据库、不扩大候选、不添加动画，也不管理业务队列。工程侧负责已添加目录、目录版本／debounce、发布时间对应季度及可配置相邻季度的候选列表。

## 模式与效果

默认词法模式使用标题和静态季度特征；语义模式增加 E5-base 检索与 Qwen3-Reranker-0.6B。效果来自已有开发数据的交叉拟合，Nyaa 长尾仍有误匹配和拒答；输出 score 未经概率校准。评测口径、数值后端差异与资源实测统一见[效果报告](REPORT.md)。

## 独立安装与构建

支持 Python 3.11–3.12、Node.js 22（仓库固定 22.23.2）。Linux 需 OpenMP 运行库，例如 Debian 的 `libgomp1`。下列命令在本目录执行，不需要数据库或其他业务包。

```bash
python3.11 -m venv .venv
. .venv/bin/activate
pip install .

# 独立构建 wheel
pip install build
python -m build --outdir build/python

# 仅构建 Node 客户端
npm install --ignore-scripts --package-lock=false
npm run build
MATCHER_TEST_PYTHON=python npm test
```

monorepo 中仍可使用 `node common/scripts/install-run-rush.js build --to @lani/anime-matcher`。npm 包仅包含传输客户端与类型；本机推理还需 Python 包及其依赖。Python wheel 包含两棵约 100 KiB 的压缩树，不包含 benchmark 或神经模型权重。

## v1 HTTP／JSONL 接入

```typescript
import { AnimeMatcherClient } from '@lani/anime-matcher';

const client = new AnimeMatcherClient({
  python: '/path/to/venv/bin/python',
  // 独立服务改用 endpoint: 'http://127.0.0.1:8090'
  semantic: false,
  timeoutMs: 120_000,
});
try {
  const catalogVersion = 'a'.repeat(64); // 示例；实际为工程侧维护的内容版本
  const status = await client.status();
  if (status.catalogVersion !== catalogVersion) {
    await client.configure({
      protocolVersion: 1, catalogVersion,
      catalog: [{
        id: 'season-id', title: '葬送的芙莉莲',
        aliases: ['葬送のフリーレン'], year: 2023, quarter: 4,
      }],
    });
  }
  const response = await client.match({
    protocolVersion: 1, catalogVersion,
    requestId: 'torrent:123:input-version',
    query: {
      aliases: ['葬送的芙莉莲'],
      publishedAt: '2023-10-01T12:00:00+08:00',
      episode: 1, // parse-torrent-title 的单集 episodeIndex
    },
    candidateIds: ['season-id'],
  });
  console.log(response.result.seasonId); // 候选 ID 或 null
} finally {
  await client.close();
}
```

目录刷新原子替换，失败保留旧目录；目录缓存可丢弃。`status()` 不加载模型，`status()`／`configure()` 可按需启动本地子进程；`match()` 不启动进程、不补目录、不重试。工程端在缓存丢失或版本不符后显式恢复。语义编码器和 reranker 跨目录刷新复用，不随每集元数据刷新。

`year`／`quarter` 是公历年与季度，允许 null；`publishedAt` 必须带时区。可选 `publisherSeason` 仅来自解析出的明确季数。协议兼容接收 `episodes`，当前模型忽略它；默认两模式也不使用 `declaredEpisodeCount`。请勿从逐集信息推导这些静态输入来抬高评测成绩。

完整字段、错误码、响应、长度限制和客户端生命周期见 [PROTOCOL.md](PROTOCOL.md)。HTTP 与 JSONL 使用相同合同。`candidateIds` 必须显式提供；空列表正常拒答，未知／重复 ID 报错。没有硬编码的 −45/+15 天窗口。

已接入旧 v1 的工程迁移差异见 [INTEGRATION.md](INTEGRATION.md)。

## 启用语义模型

```bash
# CPU 环境先选择 CPU Torch，避免默认安装 CUDA 运行库
pip install torch==2.14.1+cpu --index-url https://download.pytorch.org/whl/cpu
pip install '.[semantic]'
lani-anime-models --model-dir ./models
lani-anime-models --model-dir ./models --verify-only

lani-anime-matcher --http --host 127.0.0.1 --port 8090 \
  --semantic --model-dir ./models --device cpu --dtype float32
```

默认下载 E5-base int8 ONNX 与 Qwen3-Reranker-0.6B，总计约 1.40 GiB。固定上游 revision、文件大小与 SHA256 见 [models.json](python/lani_anime_matcher/assets/models.json)。推理仅使用本地校验通过的文件，不隐式联网。可使用 `LANI_MATCHER_MODEL_DIR` 或 `--model-dir`，允许挂载只读模型卷。**神经权重不进 Git，无需 Git LFS。** 训练数据与实验资料不随 PR、npm 包或 Python 包分发。

关闭语义时不导入 Torch、Transformers、ONNX 或日语读音模型。启用时 E5 始终在 CPU 按 batch=1 编码，单个名称的向量特征沿用 512-token 上限；Qwen 仍接收完整原始别名，超过其 2048-token 上限会报错而不截断。Qwen 可指定 `--device cuda --dtype float32`，支持原生 BF16 的 GPU 可选 `--dtype bfloat16`。CPU 仅支持 FP32。模型不自动量化或自动切换数值后端；更换后端需回归。Node 本地子进程对应选项为 `device`、`dtype`、`modelDir`；HTTP 客户端不能远程切换服务端模型。

完整标题的季数、上下半、篇章和副标题保留在原始别名及 Qwen 输入中。Unicode／简繁、字符相似度、TF-IDF、日语读音是独立软特征；读音特征中的简化不会改写原始标题。树联合判断标题与静态时间／集数证据，`−7 × episodeIndex` 只是特征之一，没有单条强制转季规则。

## Python 直接调用

Python 输入与 v1 协议一致；必须明确传入候选。模型只比较 caller 内检索到的候选，不会把全目录当成隐式候选。

```python
from lani_anime_matcher.api import Matcher

matcher = Matcher([{
    'id': 'season-id', 'title': '葬送的芙莉莲',
    'aliases': ['葬送のフリーレン'], 'year': 2023, 'quarter': 4,
}])
result = matcher.match({
    'aliases': ['葬送的芙莉莲'],
    'publishedAt': '2023-10-01T12:00:00+08:00', 'episode': 1,
}, candidate_ids=['season-id'])
```

全目录参与 TF-IDF 统计和语义索引；`candidate_ids` 只限制此次检索。改变目录内容、候选范围或模型后端都可能改变结果，不能假定任意小目录与冻结 benchmark 的分数一致。

## 容器与资源

```bash
# 无神经模型
docker build -t lani-anime-matcher:lexical .
docker run --rm -p 127.0.0.1:8090:8090 lani-anime-matcher:lexical

# CPU 语义运行；构建时下载并校验固定模型
docker build --build-arg VARIANT=semantic-cpu --build-arg WITH_MODELS=true -t lani-anime-matcher:semantic .
docker run --rm -p 127.0.0.1:8090:8090 \
  lani-anime-matcher:semantic
```

[compose.example.yaml](compose.example.yaml) 提供本地配置示例。容器以非 root 用户运行，无业务凭据。HTTP 应位于受保护的内部服务网络；每 worker 顺序处理请求。可部署成独立服务／sidecar，也可在业务镜像安装 Python 后通过 npm 客户端启动子进程。这里不包含业务队列、API 部署矩阵或私有部署修改。

CPU 语义容器建议先预留 8 GiB 内存，再按目录规模和真实标题实测。目录、候选范围、设备精度和缓存都会影响结果与延迟，资源对照见[效果报告](REPORT.md)。

开发验证与数据边界见 [AGENTS.md](AGENTS.md)。

来源与第三方资源声明见 [NOTICE.md](NOTICE.md)。

成品变体、源码构建和分层说明见 [镜像发布](IMAGES.md)。
