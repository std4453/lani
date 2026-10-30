const mockQuery = jest.fn();
const mockStateQuery = jest.fn();
const mockClient = {
  query: (options: any) =>
    options.query.definitions[0].name.value === 'SmartDownloadState'
      ? mockStateQuery(options)
      : mockQuery(options),
};
const mockContext = {
  id: 1,
  episodes: [] as { id: number; index: number; airTime: string }[],
  formRef: { current: undefined as FormInstance | undefined },
  updateTouched: jest.fn(),
};
jest.mock('@/components/SearchTorrentDialog', () => ({
  useAddDownloadPatternDialog: () => [null, null, jest.fn()],
}));
jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useApolloClient: () => mockClient,
}));
jest.mock('../../help', () => ({
  formItemProps: {},
  useSeasonPageContext: () => mockContext,
}));
import React from 'react';
import ReactDOM from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import { Form, FormInstance, Modal } from 'antd';
import DownloadSources from '../download-sources';

import { DownloadSettings } from './settings';

const initial: DownloadSettings = {
  smartDownloadEnabled: false,
  smartDownloadSubtitle: 'chinese',
  smartDownloadPreferBaha: false,
  smartDownloadWindowHours: 48,
  smartDownloadTimeoutMinutes: 120,
  downloadOffsetType: 'postpone',
  downloadOffsetDays: 1,
  downloadOffsetHours: 2,
};
let container: HTMLDivElement;
function Harness() {
  const [form] = Form.useForm();
  mockContext.formRef.current = form;
  return (
    <Form
      form={form}
      initialValues={{
        ...initial,
        downloadSources: [{ id: 9, pattern: '%test%', offset: 12 }],
      }}
    >
      <DownloadSources />
    </Form>
  );
}
const settle = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 30));
  });
async function click(text: string, scope: ParentNode = document) {
  const button = [...scope.querySelectorAll('button')].find(
    (el) => el.textContent?.replace(/\s/g, '') === text.replace(/\s/g, ''),
  );
  expect(button).toBeDefined();
  act(() => button!.click());
  await settle();
}
async function changeHours(hours: string) {
  const input = document.querySelector<HTMLInputElement>(
    'input[aria-label="下载偏移小时数"]',
  )!;
  act(() => {
    Simulate.change(input, { target: { value: hours } } as any);
  });
  act(() => {
    Simulate.blur(input);
  });
  await settle();
}
beforeEach(() => {
  mockStateQuery.mockReset().mockResolvedValue({
    data: {
      allTasks: { nodes: [], pageInfo: { hasNextPage: false } },
      config: { matching: { mode: 'semantic' } },
    },
  });
  localStorage.clear();
  mockContext.episodes = [];
  mockQuery.mockReset().mockResolvedValue({
    data: {
      allTorrents: {
        nodes: [],
        pageInfo: {
          endCursor: null,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
    },
  });
  mockContext.updateTouched.mockClear();
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    ReactDOM.render(<Harness />, container);
  });
});
afterEach(async () => {
  act(() => {
    ReactDOM.unmountComponentAtNode(container);
    Modal.destroyAll();
  });
  await settle();
  container.remove();
});
test('首次说明和设置均可取消；仅设置确认才记忆，并把偏移写入页面草稿', async () => {
  await click('开启智能下载');
  await click('取消', document.querySelector('.ant-modal-confirm')!);
  expect(localStorage.getItem('lani.smart-download.confirmed')).toBeNull();
  await click('开启智能下载');
  await click('确定', document.querySelector('.ant-modal-confirm')!);
  await changeHours('5');
  await click(
    '取消',
    document.querySelector('.ant-modal:not(.ant-modal-confirm)')!,
  );
  expect(
    mockContext.formRef.current!.getFieldValue('downloadOffsetHours'),
  ).toBe(2);
  expect(localStorage.getItem('lani.smart-download.confirmed')).toBeNull();
  await click('开启智能下载');
  await click('确定', document.querySelector('.ant-modal-confirm')!);
  await changeHours('5');
  await click(
    '开启智能下载',
    document.querySelector('.ant-modal:not(.ant-modal-confirm)')!,
  );
  expect(mockContext.formRef.current!.getFieldsValue(true)).toMatchObject({
    smartDownloadEnabled: true,
    downloadOffsetHours: 5,
  });
  expect(localStorage.getItem('lani.smart-download.confirmed')).toBe('true');
  expect(mockContext.updateTouched).toHaveBeenCalledTimes(1);
  let submitted: any;
  await act(async () => {
    submitted = await mockContext.formRef.current!.validateFields();
  });
  expect(submitted).toMatchObject({
    downloadOffsetHours: 5,
    downloadSources: [{ id: 9, pattern: '%test%', offset: 12 }],
  });
  expect(container.textContent).toContain('延后 29 小时');
});
test('词法模式警告和自动刷新提示显示，状态标签替代集号且没有详情入口', async () => {
  localStorage.setItem('lani.smart-download.confirmed', 'true');
  mockStateQuery.mockResolvedValue({
    data: {
      config: { matching: { mode: 'lexical' } },
      allTasks: {
        pageInfo: { hasNextPage: false },
        nodes: [
          {
            id: 7,
            smartDownloadTorrentHash: 'abc',
            statusSummary: {
              version: 1,
              legacy: {
                stage: 'DOWNLOADING',
                isCancelled: true,
                isFailed: false,
              },
            },
          },
        ],
      },
    },
  });
  mockQuery.mockResolvedValue({
    data: {
      allTorrents: {
        nodes: [
          {
            id: 1,
            hash: 'abc',
            title: 'test',
            size: '1024',
            publishDate: '2020-01-01T00:00:00Z',
            parseVersion: 1,
            channel: 'MIKAN',
            episodeInfo: { type: 'episode', index: 9 },
          },
        ],
        pageInfo: {
          endCursor: null,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
    },
  });
  await click('开启智能下载');
  expect(document.body.textContent).toContain(
    '使用词法模式时的识别准确率可能较低，不建议开启智能下载',
  );
  expect(document.body.textContent).toContain('自动刷新中');
  const cell = document.querySelector('.ant-modal tbody tr td')!;
  expect(cell.textContent).toBe('已取消');
  expect(cell.querySelector('[aria-label="select"]')).toBeNull();
  act(() => (cell.querySelector('.ant-tag') as HTMLElement).click());
  expect(document.querySelectorAll('.ant-modal')).toHaveLength(1);
});
test('关闭只改开关，保留原规则和设置；再次打开采用保留值', async () => {
  localStorage.setItem('lani.smart-download.confirmed', 'true');
  act(() =>
    mockContext.formRef.current!.setFieldsValue({
      smartDownloadEnabled: true,
      smartDownloadWindowHours: 72,
    }),
  );
  await click('设置…');
  await changeHours('9');
  await click('关闭智能下载');
  expect(mockContext.formRef.current!.getFieldsValue(true)).toMatchObject({
    smartDownloadEnabled: false,
    smartDownloadWindowHours: 72,
    downloadOffsetHours: 2,
    downloadSources: [{ id: 9, pattern: '%test%', offset: 12 }],
  });
  await click('开启智能下载');
  expect(document.querySelector('.ant-modal-confirm')).toBeNull();
  expect(
    document.querySelector<HTMLInputElement>(
      'input[aria-label="下载偏移小时数"]',
    )!.value,
  ).toBe('2');
  await click('开启智能下载', document.querySelector('.ant-modal')!);
  expect(
    mockContext.formRef.current!.getFieldValue('smartDownloadWindowHours'),
  ).toBe(72);
});
test('预览请求失败可重试，失败不丢弃设置草稿', async () => {
  localStorage.setItem('lani.smart-download.confirmed', 'true');
  mockQuery.mockRejectedValueOnce(new Error('offline'));
  await click('开启智能下载');
  expect(document.body.textContent).toContain('加载种子失败');
  await click('重试');
  await changeHours('7');
  expect(mockQuery).toHaveBeenCalledTimes(2);
  expect(
    document.querySelector<HTMLInputElement>(
      'input[aria-label="下载偏移小时数"]',
    )!.value,
  ).toBe('7');
  expect(document.body.textContent).toContain('还未开播，之后再来看看吧');
});

test('无效种子提供完整排除原因，有效种子和空区间保持各自内容', async () => {
  localStorage.setItem('lani.smart-download.confirmed', 'true');
  mockContext.episodes = [
    { id: 1, index: 1, airTime: '2020-01-01T00:00:00Z' },
    { id: 2, index: 2, airTime: '2020-01-08T00:00:00Z' },
  ];
  const torrent = {
    hash: 'valid',
    publishDate: '2020-01-01T01:00:00Z',
    size: '1000',
    episodeInfo: { type: 'episode', index: 1 },
    subtitleInfo: { languages: ['zh'] },
    parseVersion: 1,
    channel: 'MIKAN',
  };
  mockQuery.mockResolvedValueOnce({
    data: {
      allTorrents: {
        nodes: [
          { ...torrent, id: 1, title: '有效资源' },
          {
            ...torrent,
            id: 2,
            hash: 'excluded',
            title: '资源 v2',
            subtitleInfo: null,
          },
        ],
        pageInfo: {
          endCursor: null,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
    },
  });
  await click('开启智能下载');
  const rows = Array.from(
    document.querySelectorAll(
      'table[aria-label="智能下载种子预览"] tbody tr:not([data-release-ids])',
    ),
  );
  expect(rows).toHaveLength(3);
  const releases = document.querySelectorAll('tr[data-release-ids]');
  expect(releases).toHaveLength(2);
  expect(releases[0].textContent).toContain('#1 发布');
  expect(releases[0].querySelector('td')?.colSpan).toBe(5);
  expect(releases[0].nextElementSibling).toBe(rows[0]);
  expect(releases[1].nextElementSibling).toBe(rows[2]);
  const excluded = rows.find((row) => row.textContent?.includes('资源 v2'))!;
  const reason = document.getElementById(
    excluded.getAttribute('aria-describedby')!,
  );
  expect(reason?.textContent).toBe('无法下载原因：不符合字幕要求');
  expect(excluded.getAttribute('tabindex')).toBe('0');
  expect(
    rows
      .find((row) => row.textContent?.includes('有效资源'))!
      .hasAttribute('aria-describedby'),
  ).toBe(false);
  expect(
    rows
      .find((row) => row.textContent?.includes('无匹配种子'))!
      .querySelector('td')?.colSpan,
  ).toBe(5);
  const table = rows[0].closest('table')!;
  expect(table.querySelectorAll('tbody')).toHaveLength(2);
  expect(releases[0].parentElement).not.toBe(releases[1].parentElement);
  expect(table.parentElement!.lastElementChild).toBe(table);
});

test('负数天数合并到总偏移，跨零切换方向并以归一后的值保存', async () => {
  localStorage.setItem('lani.smart-download.confirmed', 'true');
  act(() => {
    mockContext.formRef.current!.setFieldsValue({
      downloadOffsetType: 'advance',
      downloadOffsetDays: 0,
      downloadOffsetHours: 1,
    });
  });
  await click('开启智能下载');
  const input = document.querySelector<HTMLInputElement>(
    'input[aria-label="下载偏移天数"]',
  )!;
  act(() => {
    Simulate.change(input, { target: { value: '-1' } } as any);
  });
  act(() => {
    Simulate.blur(input);
  });
  await settle();
  expect(input.value).toBe('0');
  expect(
    document.querySelector<HTMLInputElement>(
      'input[aria-label="下载偏移小时数"]',
    )!.value,
  ).toBe('23');
  await click('开启智能下载', document.querySelector('.ant-modal')!);
  expect(mockContext.formRef.current!.getFieldsValue(true)).toMatchObject({
    downloadOffsetType: 'postpone',
    downloadOffsetDays: 0,
    downloadOffsetHours: 23,
  });
});
