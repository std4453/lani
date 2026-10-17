let data: object | undefined;
jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useQuery: () => ({ data, refetch: jest.fn() }),
}));
jest.mock('@/utils/useTaskStates', () => ({ useTaskStates: jest.fn() }));
jest.mock('@/utils/useApolloPoll', () => ({ useApolloPoll: jest.fn() }));
jest.mock('@/components/SearchTorrentDialog', () => ({}));
jest.mock('@/store/config', () => ({}));
jest.mock('@/constants/link', () => ({}));
jest.mock('umi', () => ({ Link: () => null }));

import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { LegacyTaskStage, TaskType } from '@/generated/types';
import { DownloadStatusTag } from '@/constants/download-status';
import { Episode } from '../../help';
import { useEpisodeStatus } from './index';

it.each([TaskType.Download, TaskType.Import, TaskType.BatchImport])(
  '轮询返回 %s 后，状态标签按任务类型打开详情',
  (type) => {
    data = undefined;
    const open = jest.fn();
    const container = document.createElement('div');
    const episodes = [{ id: 7 }] as Episode[];
    function Harness() {
      const state = useEpisodeStatus(episodes).episodesStatus?.[7];
      return state ? (
        <DownloadStatusTag
          status={state.taskStatus}
          taskId={state.taskId}
          taskType={state.taskType}
          openTaskDetails={open}
        />
      ) : null;
    }
    try {
      act(() => {
        ReactDOM.render(<Harness />, container);
      });
      expect(container.textContent).toBe('');
      data = {
        allEpisodes: {
          edges: [
            {
              node: {
                id: 7,
                jellyfinEpisodeId: null,
                airTime: null,
                tasks: {
                  edges: [
                    {
                      node: {
                        id: 42,
                        type,
                        workflow: {
                          schemaVersion: 1,
                          definitionVersion: 1,
                          createdAt: '2026-10-16T00:00:00Z',
                          status: 'running',
                          currentStepId: 'import',
                          steps: [
                            {
                              id: 'import',
                              atom: 'importFile',
                              title: '导入文件',
                              status: 'running',
                              attempt: 1,
                              checkpoint: {},
                            },
                          ],
                        },
                        version: 0,
                        legacyStage: LegacyTaskStage.Importing,
                        isFailed: false,
                        isCancelled: false,
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      };
      act(() => {
        ReactDOM.render(<Harness />, container);
      });
      const tag = container.querySelector('.ant-tag');
      expect(tag).not.toBeNull();
      act(() => {
        tag!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
      expect(open).toHaveBeenCalledWith({ taskId: 42, taskType: type });
    } finally {
      act(() => {
        ReactDOM.unmountComponentAtNode(container);
      });
    }
  },
);
