jest.mock('@/constants/download-status', () => ({
  calcEpisodeStatus: () => ({ status: 'missing' }),
  DownloadStatusTag: () => <span>缺集</span>,
}));
import React from 'react';
import ReactDOM from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import ImportConfirmDialog, { ImportEpisode } from './ImportConfirmDialog';

it('真实下拉框重新选中当前剧集后固定映射，重置后恢复自动匹配', () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const episodes = [4, 5].map((id) => ({
    id,
    title: `第 ${id} 集`,
    index: id,
    numbering: { type: 'episode', number: String(id) },
    jellyfinEpisodeId: null,
    matchingTasks: { nodes: [] },
  })) as unknown as ImportEpisode[];
  const selection = () =>
    document.querySelector('.ant-select-selection-item')?.textContent;
  try {
    act(() => {
      ReactDOM.render(
        <ImportConfirmDialog
          visible
          title="测试季度"
          episodes={episodes}
          importPaths={['/source/04.mkv']}
          onCancel={jest.fn()}
          onSubmit={jest.fn()}
        />,
        container,
      );
    });
    act(() =>
      Simulate.mouseDown(document.querySelector('.ant-select-selector')!),
    );
    const option = document.querySelector('.ant-select-item-option-selected')!;
    expect(option.textContent).toContain('第 4 集');
    act(() => Simulate.click(option));
    const increase = document.querySelector<HTMLButtonElement>(
      'button[aria-label="偏移增加 1"]',
    )!;
    act(() => increase.click());
    expect(selection()).toContain('第 4 集');
    const reset = [...document.querySelectorAll('button')].find(
      (button) => button.textContent?.replace(/\s/g, '') === '重置',
    )!;
    act(() => reset.click());
    act(() => increase.click());
    expect(selection()).toContain('第 5 集');
  } finally {
    act(() => {
      ReactDOM.unmountComponentAtNode(container);
    });
    container.remove();
  }
});
