import { llmConfig } from './llm';

it.each([undefined, {}])('共享 LLM 配置可省略：%j', (input) => {
  const { value, error } = llmConfig.validate(input);
  expect(error).toBeUndefined();
  expect(value).toEqual({ concurrency: 2, timeoutMs: 45000 });
});

it('共享限制独立于具体模型配置', () => {
  const { value, error } = llmConfig.validate({
    concurrency: 3,
    timeoutMs: 1000,
  });
  expect(error).toBeUndefined();
  expect(value).toEqual({ concurrency: 3, timeoutMs: 1000 });
});

it.each([
  false,
  { concurrency: 0 },
  { concurrency: 1.5 },
  { timeoutMs: 0 },
  { timeoutMs: 1.5 },
  { timeoutMs: Infinity },
  { timeoutMs: 2147483648 },
])('共享 LLM 配置拒绝无效值 %j', (input) =>
  expect(llmConfig.validate(input).error).toBeDefined(),
);

it('接受 Node 计时器支持的最大延迟', () => {
  expect(llmConfig.validate({ timeoutMs: 2147483647 }).error).toBeUndefined();
});
