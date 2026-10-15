import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { importFile } from './import-file.operation';
import { AtomContext, ExecutionStopped } from '@/task/atom';
import { Checkpoint } from '@lani/workflow';
let directory: string;
beforeEach(async () => {
  directory = await fs.mkdtemp(path.join(os.tmpdir(), 'lani-import-'));
});
afterEach(async () => {
  await fs.rm(directory, { recursive: true, force: true });
});
function context(checkpoint: Checkpoint = {}): AtomContext {
  return {
    stepId: 'test',
    attempt: 1,
    waitFor: async (operation) => operation,
    checkpoint,
    assertActive: jest.fn(async () => undefined),
    wait: jest.fn(),
    transaction: jest.fn(),
    saveCheckpoint: async (value) => {
      Object.assign(checkpoint, value);
    },
  };
}
it('移动完成后重复执行不要求源文件存在', async () => {
  const source = path.join(directory, 'source.mkv'),
    target = path.join(directory, 'out', 'target.mkv');
  await fs.writeFile(source, 'video');
  const ctx = context();
  await importFile(1, source, target, 'moveOnly', ctx);
  await expect(fs.stat(source)).rejects.toMatchObject({ code: 'ENOENT' });
  await expect(importFile(1, source, target, 'moveOnly', ctx)).resolves.toBe(
    target,
  );
  expect(await fs.readFile(target, 'utf8')).toBe('video');
});
it('文件已发布但检查点写入失败，重启按暂存身份确认成果', async () => {
  const source = path.join(directory, 'source'),
    target = path.join(directory, 'target');
  await fs.writeFile(source, 'video');
  const ctx = context();
  const save = ctx.saveCheckpoint;
  ctx.saveCheckpoint = async (value) => {
    if (value.file?.phase === 'published') throw new Error('数据库断连');
    await save(value);
  };
  await expect(importFile(1, source, target, 'copyOnly', ctx)).rejects.toThrow(
    '数据库断连',
  );
  const recovered = context(ctx.checkpoint);
  await expect(
    importFile(1, source, target, 'copyOnly', recovered),
  ).resolves.toBe(target);
});
it('取消后不发布暂存文件，已有目标不会被覆盖', async () => {
  const source = path.join(directory, 'source'),
    target = path.join(directory, 'target');
  await fs.writeFile(source, 'video');
  const ctx = context();
  jest
    .spyOn(ctx, 'assertActive')
    .mockResolvedValueOnce()
    .mockRejectedValue(new ExecutionStopped());
  await expect(
    importFile(1, source, target, 'copyOnly', ctx),
  ).rejects.toBeInstanceOf(ExecutionStopped);
  await expect(fs.stat(target)).rejects.toMatchObject({ code: 'ENOENT' });
  await fs.writeFile(target, 'other');
  await expect(
    importFile(2, source, target, 'copyOnly', context()),
  ).rejects.toThrow('不属于本任务');
  expect(await fs.readFile(target, 'utf8')).toBe('other');
});

it('复制期间源文件变化时拒绝发布', async () => {
  const source = path.join(directory, 'source'),
    target = path.join(directory, 'target');
  await fs.writeFile(source, 'video');
  const copy = fs.copyFile.bind(fs);
  const spy = jest.spyOn(fs, 'copyFile').mockImplementation(async (...args) => {
    await copy(...args);
    await fs.writeFile(source, 'changed video');
  });
  try {
    await expect(
      importFile(1, source, target, 'copyOnly', context()),
    ).rejects.toThrow('源文件发生变化');
    await expect(fs.stat(target)).rejects.toMatchObject({ code: 'ENOENT' });
  } finally {
    spy.mockRestore();
  }
});

it.each(['copyOnly', 'moveOnly'])(
  '%s 不尝试在源文件系统创建硬链接',
  async (strategy) => {
    const source = path.join(directory, 'source'),
      target = path.join(directory, 'target');
    await fs.writeFile(source, 'video');
    const link = fs.link.bind(fs);
    const spy = jest.spyOn(fs, 'link').mockImplementation(async (from, to) => {
      if (from === source)
        throw Object.assign(new Error('unsupported'), { code: 'ENOTSUP' });
      return link(from, to);
    });
    try {
      await expect(
        importFile(1, source, target, strategy, context()),
      ).resolves.toBe(target);
      expect(await fs.readFile(target, 'utf8')).toBe('video');
      if (strategy === 'moveOnly')
        await expect(fs.stat(source)).rejects.toMatchObject({ code: 'ENOENT' });
      else expect(await fs.readFile(source, 'utf8')).toBe('video');
    } finally {
      spy.mockRestore();
    }
  },
);
