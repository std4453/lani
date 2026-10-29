const mockQuery = jest.fn();
const mockClient = { query: mockQuery };
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
  await settle();
}
beforeEach(() => {
  localStorage.clear();
  mockContext.episodes = [];
  mockQuery.mockReset().mockResolvedValue({
    data: {
      smartDownloadPreview: {
        nodes: [],
        cursor: null,
        hasMore: false,
        excludes: [],
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
    '确定',
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
test('关闭只改开关，保留原规则和设置；再次打开采用保留值', async () => {
  localStorage.setItem('lani.smart-download.confirmed', 'true');
  act(() =>
    mockContext.formRef.current!.setFieldsValue({
      smartDownloadEnabled: true,
      smartDownloadWindowHours: 72,
    }),
  );
  await click('设置……');
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
  await click('确定', document.querySelector('.ant-modal')!);
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
  expect(document.body.textContent).toContain('无匹配种子');
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
    ready: true,
  };
  mockQuery.mockResolvedValueOnce({
    data: {
      smartDownloadPreview: {
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
        cursor: null,
        hasMore: false,
        excludes: [],
      },
    },
  });
  await click('开启智能下载');
  const rows = Array.from(
    document.querySelectorAll('table[aria-label="智能下载种子预览"] tbody tr'),
  );
  expect(rows).toHaveLength(3);
  const excluded = rows.find((row) => row.textContent?.includes('资源 v2'))!;
  const reason = document.getElementById(
    excluded.getAttribute('aria-describedby')!,
  );
  expect(reason?.textContent).toBe('不符合字幕要求；命中标题或片源屏蔽规则');
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
});
