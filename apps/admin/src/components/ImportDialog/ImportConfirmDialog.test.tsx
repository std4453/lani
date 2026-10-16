jest.mock('@/constants/download-status', () => ({
  calcEpisodeStatus: () => ({ status: 'missing' }),
  DownloadStatusTag: () => <span>缺集</span>,
}));
jest.mock('@/utils/error', () => ({ handleError: jest.fn() }));
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  Select: ({
    value,
    options,
    onChange,
    disabled,
  }: {
    value?: number;
    options: { value: number }[];
    onChange(value: number): void;
    disabled?: boolean;
  }) => (
    <select
      disabled={disabled}
      value={value ?? ''}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      <option value="">请选择</option>
      {options.map((o: { value: number }) => (
        <option value={o.value} key={o.value}>
          {o.value}
        </option>
      ))}
    </select>
  ),
}));
import React from 'react';
import ReactDOM from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import ImportConfirmDialog, { ImportEpisode } from './ImportConfirmDialog';
const episodes = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  title: `第 ${i + 1} 集`,
  index: i + 1,
  numbering: { type: 'episode', number: String(i + 1) },
  jellyfinEpisodeId: null,
  matchingTasks: { nodes: [] },
})) as unknown as ImportEpisode[];
const paths = Array.from(
  { length: 12 },
  (_, i) => `/source/Anime - ${13 + i}.mkv`,
);
let container: HTMLDivElement;
let submit: jest.Mock;
const render = (input = paths, visible = true) =>
  act(() => {
    ReactDOM.render(
      <ImportConfirmDialog
        visible={visible}
        title="测试季度"
        episodes={episodes}
        importPaths={input}
        onCancel={jest.fn()}
        onSubmit={submit}
      />,
      container,
    );
  });
const button = (text: string) =>
  [...document.querySelectorAll<HTMLButtonElement>('button')].find(
    (b) => b.textContent?.replace(/\s/g, '') === text,
  )!;
beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  submit = jest.fn(async () => undefined);
});
afterEach(() => {
  act(() => {
    ReactDOM.unmountComponentAtNode(container);
  });
  container.remove();
});
it('显示偏移提示，手工修改和删除不会重新推断，也不修改原始选择', async () => {
  render();
  expect(document.body.textContent).toContain('已按文件编号减 12 匹配');
  const select = document.querySelector<HTMLSelectElement>('select')!;
  expect(select.value).toBe('1');
  act(() => {
    select.value = '2';
    Simulate.change(select);
  });
  expect(button('导入').disabled).toBe(true);
  const secondDelete = document.querySelectorAll<HTMLButtonElement>(
    'button[aria-label^="删除"]',
  )[1];
  act(() => secondDelete.click());
  render([...paths]);
  expect(document.querySelector('select')!.value).toBe('2');
  expect(document.querySelectorAll('select')).toHaveLength(11);
  expect(paths).toHaveLength(12);
  await act(async () => button('导入').click());
  expect(submit.mock.calls[0][0][0]).toEqual({
    importPath: paths[0],
    episodeId: 2,
  });
  expect(submit.mock.calls[0][0]).toHaveLength(11);
});
it('恢复原编号仅恢复映射，不恢复删除行；未匹配行阻止提交', () => {
  render();
  act(() =>
    document
      .querySelector<HTMLButtonElement>('button[aria-label^="删除"]')!
      .click(),
  );
  act(() => button('恢复原编号').click());
  expect(document.querySelectorAll('select')).toHaveLength(11);
  expect([...document.querySelectorAll('select')].every((s) => !s.value)).toBe(
    true,
  );
  expect(button('导入').disabled).toBe(true);
});
it('创建失败保留最终映射；只有重新打开确认页才初始化', async () => {
  render();
  submit.mockRejectedValueOnce(new Error('offline'));
  await act(async () => button('导入').click());
  expect(document.querySelectorAll('select')).toHaveLength(12);
  expect(document.querySelector('select')!.value).toBe('1');
  expect(button('导入').disabled).toBe(false);
  render(paths, false);
  render(paths);
  expect(document.querySelectorAll('select')).toHaveLength(12);
});
