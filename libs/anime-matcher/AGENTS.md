# 匹配器开发

保持调用方显式候选、目录原子替换与可丢弃缓存的边界。协议见 [PROTOCOL.md](PROTOCOL.md)，工程兼容约束见 [INTEGRATION.md](INTEGRATION.md)。运行测试与评测分开记录：训练、选型、挖错使用过的数据仍属于开发数据，不能重新称为独立盲测；不得从真值或逐集元数据推导输入提升成绩。

在本包运行：

```bash
python -m unittest discover -s tests -p 'test_*.py' -v
npm run build
MATCHER_TEST_PYTHON=python npm test
```

可选神经模型测试需本地已校验资源，默认 CI 不下载权重。更换 Torch、设备、精度或模型清单时，按[镜像说明](IMAGES.md)验证实际推理并记录分数、决策、耗时和内存变化。

训练数据与实验资料保留在独立研究存储，公开提交仅包含运行方案、合成回归和有明确口径的报告。神经权重通过固定清单下载和校验，不提交到 Git；第三方来源与再分发约束维护在 [NOTICE.md](NOTICE.md)。
