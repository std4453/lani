const mutate = jest.fn();
const query = jest.fn();
const openDetails = jest.fn();
jest.mock('@apollo/client', () => ({
  useApolloClient: () => ({ mutate, query }),
}));
jest.mock('@/components/TaskDetailsDialog', () => ({
  useTaskDetailsDialog: () => [null, null, openDetails],
}));
jest.mock('@/utils/error', () => ({ handleError: jest.fn() }));
jest.mock('@/components/SearchTorrentDialog/SearchTorrent', () => ({
  SearchTorrentModal: (props: any) =>
    props.visible ? (
      <div>
        <button onClick={() => props.setSelected({ id: 7 })}>选择种子</button>
        <span data-testid="selected">{props.selected?.id}</span>
        <button onClick={() => props.onSubmit(props.selected)}>读取</button>
        <button onClick={props.onCancel}>关闭搜索</button>
        <span data-testid="reading">{String(props.submitting)}</span>
      </div>
    ) : null,
}));
jest.mock('@/components/ImportDialog/FileExplorer', () => ({
  FileExplorer: (props: any) => (
    <button onClick={() => props.setSelected(['/Season/01.mkv'])}>
      选择文件 {props.selected.join(',')}
    </button>
  ),
}));
jest.mock('@/components/ImportDialog/ImportConfirmDialog', () => ({
  __esModule: true,
  default: (props: any) =>
    props.visible ? (
      <div>
        <button onClick={props.onCancel}>返回文件</button>
        <button onClick={props.onClose}>关闭确认</button>
        <button
          onClick={() =>
            props.onSubmit([{ episodeId: 1, importPath: props.importPaths[0] }])
          }
        >
          确认下载
        </button>
      </div>
    ) : null,
}));

import React from 'react';
import ReactDOM from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import { BatchDownloadDialog } from './index';
import {
  DownloadTorrentForSeasonDocument,
  PreviewTorrentDocument,
} from '@/generated/types';

let container: HTMLDivElement;
const reject = jest.fn();
const resolve = jest.fn();
function button(text: string) {
  return [...document.querySelectorAll('button')].find((b) =>
    b.textContent?.replace(/\s/g, '').startsWith(text),
  )!;
}
const click = async (text: string) => {
  await act(async () => {
    Simulate.click(button(text));
  });
};
beforeEach(() => {
  jest.clearAllMocks();
  container = document.createElement('div');
  document.body.appendChild(container);
  query.mockResolvedValue({
    data: {
      seasonById: {
        title: 'Season',
        episodesBySeasonId: { totalCount: 1, nodes: [{ id: 1 }] },
      },
    },
  });
  mutate.mockResolvedValue({
    data: {
      previewTorrent: {
        token: 'preview',
        files: [{ path: 'Season/01.mkv', size: 100 }],
      },
    },
  });
  act(() => {
    ReactDOM.render(
      <BatchDownloadDialog
        visible
        input={{ seasonId: 3, title: 'Season' }}
        reject={reject}
        resolve={resolve}
      />,
      container,
    );
  });
});
afterEach(() => {
  act(() => {
    ReactDOM.unmountComponentAtNode(container);
  });
  container.remove();
});
it('返回保留种子和文件选择；只有最终确认才创建任务并打开详情', async () => {
  await click('选择种子');
  await click('读取');
  expect(mutate).toHaveBeenCalledWith({
    mutation: PreviewTorrentDocument,
    variables: { torrentId: 7 },
  });
  await click('上一步');
  expect(document.querySelector('[data-testid=selected]')?.textContent).toBe(
    '7',
  );
  await click('读取');
  await click('选择文件');
  await click('下一步');
  await click('返回文件');
  expect(button('选择文件').textContent).toContain('/Season/01.mkv');
  await click('下一步');
  expect(mutate).toHaveBeenCalledTimes(2);
  mutate.mockResolvedValueOnce({ data: { downloadTorrentForSeason: 42 } });
  await click('确认下载');
  expect(mutate).toHaveBeenLastCalledWith({
    mutation: DownloadTorrentForSeasonDocument,
    variables: {
      seasonId: 3,
      previewToken: 'preview',
      entries: [{ episodeId: 1, path: 'Season/01.mkv' }],
    },
  });
  expect(resolve).toHaveBeenCalled();
  expect(openDetails).toHaveBeenCalledWith({
    taskId: 42,
    taskType: 'BATCH_DOWNLOAD',
  });
});
it('读取中关闭后忽略迟到响应，不继续流程或创建任务', async () => {
  let finish!: (value: any) => void;
  mutate.mockReturnValueOnce(new Promise((resolve) => (finish = resolve)));
  await click('选择种子');
  await click('读取');
  expect(document.querySelector('[data-testid=reading]')?.textContent).toBe(
    'true',
  );
  await click('关闭搜索');
  expect(reject).toHaveBeenCalled();
  await act(async () => {
    finish({ data: { previewTorrent: { token: 'late', files: [] } } });
  });
  expect(document.querySelector('[data-testid=selected]')).not.toBeNull();
  expect(mutate).toHaveBeenCalledTimes(1);
  expect(resolve).not.toHaveBeenCalled();
});
