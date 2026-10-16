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
    onSelect,
    disabled,
    status,
  }: {
    value?: number;
    options: { value: number }[];
    onChange(value: number): void;
    onSelect(): void;
    disabled?: boolean;
    status?: string;
  }) => (
    <select
      disabled={disabled}
      aria-invalid={status === 'error'}
      value={value ?? ''}
      onChange={(e) => {
        onChange(Number(e.target.value));
        onSelect();
      }}
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
const render = (input = paths, visible = true, seasonEpisodes = episodes) =>
  act(() => {
    ReactDOM.render(
      <ImportConfirmDialog
        visible={visible}
        title="测试季度"
        episodes={seasonEpisodes}
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
it('默认填入计算偏移，手工修改和删除不会重新推断，也不修改原始选择', async () => {
  render();
  expect(
    document.querySelector<HTMLInputElement>('input[aria-label="偏移"]')!.value,
  ).toBe('-12');
  expect(document.querySelector('.ant-alert')).toBeNull();
  const select = document.querySelector<HTMLSelectElement>('select')!;
  expect(select.value).toBe('1');
  act(() => {
    select.value = '2';
    Simulate.change(select);
  });
  expect(button('导入').disabled).toBe(false);
  await act(async () => button('导入').click());
  expect(submit).not.toHaveBeenCalled();
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
const input = () =>
  document.querySelector<HTMLInputElement>('input[aria-label="偏移"]')!;
const step = (direction: string, value: number) =>
  document.querySelector<HTMLButtonElement>(
    `button[aria-label="偏移${direction} ${value}"]`,
  )!;
const selections = () => [...document.querySelectorAll('select')];
const selected = () => selections().map((s) => s.value);
it('按钮允许越界，空洞之后仍按原编号匹配；输入仅在失焦或回车时提交', () => {
  render(['/source/04.mkv'], true, [episodes[1], episodes[3]]);
  expect(selected()).toEqual(['4']);
  act(() => step('减少', 1).click());
  expect(selected()).toEqual(['']);
  act(() => step('减少', 1).click());
  expect(selected()).toEqual(['2']);
  act(() => step('减少', 12).click());
  expect(input().value).toBe('-14');
  expect(selected()).toEqual(['']);
  expect(step('减少', 12).disabled).toBe(false);
  act(() => step('增加', 12).click());
  expect(selected()).toEqual(['2']);
  act(() => Simulate.change(input(), { target: { value: '100' } } as never));
  expect(selected()).toEqual(['2']);
  act(() => Simulate.blur(input()));
  expect(input().value).toBe('100');
  expect(selected()).toEqual(['']);
  expect(step('增加', 12).disabled).toBe(false);
  act(() => Simulate.change(input(), { target: { value: '0' } } as never));
  expect(selected()).toEqual(['']);
  act(() =>
    Simulate.keyDown(input(), { key: 'Enter', keyCode: 13, which: 13 }),
  );
  expect(selected()).toEqual(['4']);
  expect(document.querySelector('.ant-input-number-handler-wrap')).toBeNull();
});
it('未匹配时仍能点击导入，点击后标红，补齐映射才创建任务', async () => {
  render(['/source/06.mkv', '/source/99.mkv']);
  expect(selected()).toEqual(['6', '']);
  expect(selections()[1].getAttribute('aria-invalid')).toBe('false');
  expect(button('导入').disabled).toBe(false);
  await act(async () => button('导入').click());
  expect(submit).not.toHaveBeenCalled();
  expect(selections()[0].getAttribute('aria-invalid')).toBe('false');
  expect(selections()[1].getAttribute('aria-invalid')).toBe('true');
  act(() => {
    selections()[1].value = '7';
    Simulate.change(selections()[1]);
  });
  expect(selections()[1].getAttribute('aria-invalid')).toBe('false');
  await act(async () => button('导入').click());
  expect(submit).toHaveBeenCalledWith([
    { importPath: '/source/06.mkv', episodeId: 6 },
    { importPath: '/source/99.mkv', episodeId: 7 },
  ]);
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

it('手动普通文件可选 SP，修改后保持固定；重置清除手动标记和未解析文件映射', () => {
  const special = {
    ...episodes[0],
    id: 100,
    numbering: { type: 'sp', number: '1' },
  } as ImportEpisode;
  render(
    [
      '/source/04.mkv',
      '/source/06.mkv',
      '/source/Anime SP01.mkv',
      '/source/unknown.mkv',
    ],
    true,
    [...episodes, special],
  );
  act(() => {
    selections()[1].value = '100';
    Simulate.change(selections()[1]);
    selections()[3].value = '12';
    Simulate.change(selections()[3]);
  });
  act(() => step('减少', 12).click());
  expect(selected()).toEqual(['', '100', '100', '12']);
  act(() => button('重置').click());
  expect(input().value).toBe('0');
  expect(selected()).toEqual(['4', '6', '100', '']);
  act(() => step('减少', 1).click());
  expect(selected()).toEqual(['3', '5', '100', '']);
});
it('重置后的空映射仍参与后续偏移，不恢复已删除行', () => {
  render(['/source/13.mkv', '/source/14.mkv']);
  act(() => {
    selections()[0].value = '6';
    Simulate.change(selections()[0]);
  });
  act(() =>
    document
      .querySelectorAll<HTMLButtonElement>('button[aria-label^="删除"]')[1]
      .click(),
  );
  act(() => button('重置').click());
  expect(selected()).toEqual(['']);
  act(() => step('减少', 12).click());
  expect(selected()).toEqual(['1']);
});
