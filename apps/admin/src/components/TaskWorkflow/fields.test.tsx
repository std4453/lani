import ReactDOM from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import { TaskDetailsFieldsFragment, TaskType } from '@/generated/types';
import TaskInfo from './TaskInfo';
import { atomViews } from './atoms';

let container: HTMLDivElement;
beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});
afterEach(() => {
  act(() => {
    ReactDOM.unmountComponentAtNode(container);
  });
  container.remove();
});

test.each(Object.values(TaskType))(
  'only download tasks show torrent links (%s)',
  (type) => {
    act(() => {
      ReactDOM.render(
        <TaskInfo
          task={{
            type,
            createdAt: '2026-01-01',
            torrentLink: 'magnet:?xt=demo',
          }}
        />,
        container,
      );
    });
    expect(container.textContent?.includes('种子地址')).toBe(
      [TaskType.Download, TaskType.BatchDownload].includes(type),
    );
  },
);

test('file list tooltip belongs to the count, leaving the copy control independent', async () => {
  const task = {
    type: TaskType.BatchImport,
    batchEntries: [
      {
        id: '1',
        episodeId: 1,
        sourcePath: '/demo/1.mkv',
        importPath: '/demo/1.mkv',
      },
      {
        id: '2',
        episodeId: 2,
        sourcePath: '/demo/2.mkv',
        importPath: '/demo/2.mkv',
      },
    ],
  } as TaskDetailsFieldsFragment;
  act(() => {
    ReactDOM.render(
      <>{atomViews.findImportFiles.fields!(task, false)}</>,
      container,
    );
  });
  const copy = container.querySelector('.ant-typography-copy')!;
  const hover = async (element: Element) => {
    await act(async () => {
      Simulate.mouseEnter(element);
      await new Promise((resolve) => setTimeout(resolve, 150));
    });
  };
  await hover(copy);
  expect(document.querySelector('[role="tooltip"]')?.textContent).toBe('Copy');
  await act(async () => {
    Simulate.mouseLeave(copy);
    await new Promise((resolve) => setTimeout(resolve, 150));
  });
  const count = [...container.querySelectorAll('span')].find(
    (element) =>
      element.textContent === '2 个文件' && element.childElementCount === 0,
  )!;
  await hover(count);
  const visible = document.querySelector(
    '.ant-tooltip:not(.ant-tooltip-hidden)',
  );
  expect(visible?.textContent).toBe('/demo/1.mkv/demo/2.mkv');
});
