jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useQuery: jest.fn(),
}));
jest.mock('@/utils/useTaskStates', () => ({
  useTaskStates: () => ({ refetch: jest.fn() }),
}));
jest.mock('@/utils/useApolloPoll', () => ({
  useApolloPoll: jest.fn(),
  useForegroundOnline: () => true,
}));
jest.mock('../TaskWorkflow/TaskContent', () => ({
  __esModule: true,
  default: ({ active }: { active: boolean }) => (
    <div data-testid="workflow" data-active={active}>
      任务步骤
    </div>
  ),
}));
import React from 'react';
import { useQuery } from '@apollo/client';
import ReactDOM from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import BatchImportDetailsDialog from './index';

const source = '/downloads/complete/真实动画/[字幕组] 第14集.mkv';
const mockTask = {
  id: 42,
  workflow: { status: 'succeeded' },
  batchEntries: [
    { id: 'first', episodeId: 1, sourcePath: source },
    { id: 'deleted', episodeId: 2, sourcePath: '/deleted.mkv' },
  ],
  taskEpisodesByTaskId: {
    nodes: [
      {
        episodeId: 1,
        episodeByEpisodeId: {
          title: '终章',
          numbering: { type: 'episode', number: '14' },
          seasonBySeasonId: { id: 2, title: '真实动画' },
        },
      },
    ],
  },
};

it('页签切换流程和表格，逐字段复制完整内容，缺失关联仍可展示', () => {
  (useQuery as jest.Mock).mockReturnValue({
    data: { taskById: mockTask },
    refetch: jest.fn(),
  });
  const container = document.createElement('div');
  document.body.appendChild(container);
  const originalCopy = document.execCommand;
  const copied: string[] = [];
  document.execCommand = jest.fn(() => {
    copied.push(window.getSelection()?.toString() ?? '');
    return true;
  });
  try {
    act(() => {
      ReactDOM.render(
        <BatchImportDetailsDialog
          visible
          input={{ taskId: 42 }}
          reject={jest.fn()}
          resolve={jest.fn()}
        />,
        container,
      );
    });
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    expect(tabs.map((tab) => tab.textContent)).toEqual([
      '任务流程',
      '文件列表',
    ]);
    expect(document.querySelector('.ant-tabs-extra-content')?.textContent).toBe(
      '自动刷新中',
    );
    expect(
      document
        .querySelector('[data-testid="workflow"]')
        ?.getAttribute('data-active'),
    ).toBe('true');
    act(() => Simulate.click(tabs[1]));
    expect(
      document
        .querySelector('[data-testid="workflow"]')
        ?.getAttribute('data-active'),
    ).toBe('false');
    const table = document.querySelector('.ant-table')!;
    expect(table.textContent).toContain('剧集已删除');
    const row = table.querySelector('.ant-table-row')!;
    expect(row.textContent).not.toContain('/downloads/complete');
    const buttons = row.querySelectorAll('.ant-typography-copy');
    act(() => Simulate.click(buttons[0]));
    act(() => Simulate.click(buttons[1]));
    expect(copied).toEqual([source, '#14 - 终章']);
    act(() => Simulate.click(tabs[0]));
    expect(
      document
        .querySelector('[data-testid="workflow"]')
        ?.getAttribute('data-active'),
    ).toBe('true');
  } finally {
    act(() => {
      ReactDOM.unmountComponentAtNode(container);
    });
    container.remove();
    document.execCommand = originalCopy;
  }
});
