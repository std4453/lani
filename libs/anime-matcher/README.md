# 动画季度匹配器

将一条单集种子的完整解析标题／别名、发布时间和 `episodeIndex` 匹配到**调用方明确传入的候选动画**，返回 top-1 或拒答。提供独立 Python worker、v1 HTTP／JSONL 协议、Node.js 客户端和最终效果报告。

目录输入使用数据库标题与完整 Bangumi 别名，不依赖逐集发布日期或逐集元数据。匹配器不访问数据库、不扩大候选、不添加动画，也不管理业务队列。工程侧负责已添加目录、目录版本／debounce、发布时间对应季度及可配置相邻季度的候选列表。

## 当前交付与效果

两种模式均使用完整标题和静态季度特征训练的树模型。默认关闭神经模型；启用语义模式后使用 E5-base 检索特征与 Qwen3-Reranker-0.6B 原始匹配分数。没有外部付费 API。

下表是现有 **adaptive DEV 家族交叉拟合**结果，主口径保留待核实样本的旧标签；每条真实资源分别使用两个工程候选策略，共 269,390 条普通评测引用，其中 Nyaa 7,154 条。它不是独立最终测试，也不是最终全开发集重拟合权重在训练内的成绩。

| 模式 | 全量发布行 P / R | 全量标题组等权 P / R | Nyaa 发布行 P / R | Nyaa 标题组等权 P / R |
| --- | --- | --- | --- | --- |
| `lexical` | 99.712% / 99.617% | 98.309% / 98.215% | 99.003% / 95.528% | 94.390% / 87.557% |
| `semantic`（0.6B） | 99.770% / 99.822% | 99.236% / 99.358% | 99.231% / 99.327% | 97.032% / 97.134% |

P 是接受结果的精度，R 是真值在候选内时的召回。窗外／未收录作品被错误接受也计入 P 的损失。**Nyaa 长尾未达到原先各口径均 ≥99% 的目标。** 本轮按“使用现有数据得到最佳结果交付”的范围收尾，没有新增独立系列验证集；不得把曾用于选模型、挖错的数据重新称为盲测。

后续模型对照完成后，最终仍推荐上述 0.6B 语义方案。最终交付模式的效果、拒答问题与资源记录见 [最终报告](REPORT.md)。长尾指标保留在附录，不作为本轮收尾门槛。

语义表使用冻结的 BF16 原始分数；CPU／旧显卡采用 FP32，数值并非逐 bit 相同。GTX 1070 的全部 Nyaa 请求级 raw scorer 回归中，推荐模型行 P／R 为 **99.183%／99.231%**，标题组等权为 **96.591%／97.086%**；此对照冻结了其他特征。运行后端回归、拒答、连续多季、数据修订和较宽季度候选的结果见 [最终报告](REPORT.md)。固定 0.5 阈值没有通过所有目标的校准检验，输出 `score` 不是经过认证的正确概率。

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

实测环境为 i5-12600KF、64 GiB 内存、GTX 1070 8 GiB；训练／BF16 对照使用 RTX 4080 Super 16 GiB。LightGBM 使用 CPU 4 线程。

- 0.6B 的 32 个真实标题对，在 GTX 1070 FP32 上加载约 3.10 秒、打分约 1.77 秒，峰值 allocated 显存约 2.33 GiB；不含 E5 编码和整个请求开销。
- CPU FP32 单个 151-token 标题对约 0.41 秒，加载约 3.61 秒；该进程峰值 RSS 约 3.95 GiB，不含 E5。单例不是吞吐或尾延迟保证。
- 纯标题模型在 879 条目录上初始化约 0.98 秒，64 条实际特征／预测一致性检查共约 2.33 秒。它不是完整服务吞吐测试。
- 独立 CPU 语义容器已在禁用网络、根文件系统和模型卷均只读的条件下通过真实 HTTP 配置／匹配／空候选验证。2 条目录的冷配置约 7.09 秒、一次匹配约 0.90 秒；该小目录冒烟不代表完整目录的初始化耗时。

CPU 语义容器建议先预留 8 GiB 内存并按目录规模实测。Qwen 的 batch=8、真实标题长度和有界 LRU 命中率都会影响延迟；不能把大量重复标题的热缓存速度当成冷标题性能。已完成的 4B 与 LoRA 对照未替换当前交付模型，其实验权重不随包分发。

## 验证与边界

本 PR 仅包含最终运行方案、合成输入回归测试、运行文档和 [最终报告](REPORT.md)。训练数据、实验记录与复现资料保留在本地，不随提交上传。报告是既有开发数据的汇总，无法仅凭本 PR 重跑数据集评测或重训；不应把运行测试当作精度验证。

```bash
python -m unittest discover -s tests -p 'test_*.py' -v
npm run build
MATCHER_TEST_PYTHON=python npm test
```

测试覆盖静态特征、候选范围、原子目录替换、错误／超时、以及真实 Python HTTP／JSONL 的客户端兼容性。可选的真实神经模型测试需要已校验的本地模型资源；默认 CI 不下载神经权重。

连续多季单独统计：新收集的既有开发样本中，10 条连续编号资源仅 9 条真值在窗内；静态时间语义方案正确接受 9 条，纯标题方案 8 条。规模很小，且已用于开发，不能外推“所有连续多季都可靠”。同系列同标题、分割放送、重发和错误季度仍可能无法确定，允许拒答；没有输出用于下载的 episode offset。

来源与第三方资源声明见 [NOTICE.md](NOTICE.md)。

成品变体、源码构建和分层说明见 [镜像发布](IMAGES.md)。
