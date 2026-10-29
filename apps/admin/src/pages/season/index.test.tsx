let page: import('./help').SeasonPageContextValues;
const mockQuery = jest.fn();
jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useApolloClient: () => ({ query: mockQuery }),
  useQuery: () => ({}),
}));
jest.mock('@/utils/useApolloPoll', () => ({ useApolloPoll: jest.fn() }));
jest.mock('umi', () => ({
  useParams: () => ({ id: '1' }),
  useHistory: () => ({ length: 2 }),
}));
jest.mock('./parts/connections', () => () => null);
jest.mock('./parts/download-sources', () => () => null);
jest.mock('./parts/episodes', () => () => null);
jest.mock(
  './parts/notifications',
  () =>
    function MockNotifications() {
      page = jest.requireActual('./help').useSeasonPageContext();
      return null;
    },
);

import React from 'react';
import ReactDOM from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import { MetadataSource } from '@/generated/types';
import SeasonPage from './index';

let container: HTMLDivElement;

function response(imageSuffix: string = 'original') {
  return {
    data: {
      seasonById: {
        id: 1,
        title: '示例季度',
        aliases: [],
        tags: [],
        infoSource: MetadataSource.BgmCn,
        bangumiId: '1',
        downloadOffsetHours: 0,
        downloadSourcesBySeasonId: { edges: [] },
        poster: { id: 1, downloadPath: `/poster-${imageSuffix}.jpg` },
        banner: { id: 2, downloadPath: `/banner-${imageSuffix}.jpg` },
        fanart: { id: 3, downloadPath: `/fanart-${imageSuffix}.jpg` },
      },
    },
  };
}

function button(text: string) {
  return Array.from(container.querySelectorAll('button')).find(
    (element) => element.textContent?.replace(/\s/g, '') === text,
  )!;
}

async function editTitle() {
  await act(async () => {
    Simulate.change(container.querySelector('input#title')!, {
      target: { value: '临时标题' } as HTMLInputElement,
    });
  });
  expect(button('重置').disabled).toBe(false);
}

beforeEach(async () => {
  container = document.createElement('div');
  document.body.appendChild(container);
  mockQuery.mockReset().mockResolvedValue(response());
  await act(async () => {
    ReactDOM.render(<SeasonPage />, container);
  });
});

afterEach(() => {
  act(() => {
    ReactDOM.unmountComponentAtNode(container);
  });
  container.remove();
});

it('点击重置恢复字段并清除校验错误，保持已加载的三张图片', async () => {
  const images = Array.from(container.querySelectorAll('img'));
  expect(images).toHaveLength(3);
  act(() => {
    images.forEach((image) => Simulate.load(image));
  });
  await editTitle();
  act(() => {
    page.formRef.current?.setFields([
      { name: 'title', errors: ['示例校验错误'] },
    ]);
  });
  const queryCount = mockQuery.mock.calls.length;
  act(() => {
    Simulate.click(button('重置'));
  });

  expect(page.formRef.current?.getFieldValue('title')).toBe('示例季度');
  expect(page.formRef.current?.getFieldError('title')).toEqual([]);
  expect(page.modified).toBe(false);
  expect(button('保存').disabled).toBe(true);
  expect(button('重置').disabled).toBe(true);
  expect(Array.from(container.querySelectorAll('img'))).toEqual(images);
  images.forEach((image) => expect(image.isConnected).toBe(true));
  expect(container.querySelector('.ant-spin-spinning')).toBeNull();
  expect(mockQuery).toHaveBeenCalledTimes(queryCount);
});

it('重置保留失败提示，图片重试成功后再次重置仍保留新地址', async () => {
  const images = Array.from(container.querySelectorAll('img'));
  act(() => {
    Simulate.error(images[0]);
    images.slice(1).forEach((image) => Simulate.load(image));
  });
  const failedImage = container.querySelector('[aria-label="图片加载失败"]');
  expect(failedImage).not.toBeNull();
  await editTitle();
  const queryCount = mockQuery.mock.calls.length;
  act(() => {
    Simulate.click(button('重置'));
  });
  expect(container.querySelector('[aria-label="图片加载失败"]')).toBe(
    failedImage,
  );
  expect(mockQuery).toHaveBeenCalledTimes(queryCount);

  mockQuery.mockResolvedValueOnce(response('renewed'));
  await act(async () => {
    Simulate.click(button('重新加载'));
  });
  const renewedImage = container.querySelector(
    'img[src="/poster-renewed.jpg"]',
  )!;
  expect(renewedImage).not.toBeNull();
  act(() => {
    Simulate.load(renewedImage);
  });
  await editTitle();
  const retryQueryCount = mockQuery.mock.calls.length;
  act(() => {
    Simulate.click(button('重置'));
  });
  expect(container.querySelector('img[src="/poster-renewed.jpg"]')).toBe(
    renewedImage,
  );
  expect(renewedImage.isConnected).toBe(true);
  expect(container.querySelector('.ant-spin-spinning')).toBeNull();
  expect(mockQuery).toHaveBeenCalledTimes(retryQueryCount);
});

it('刷新季度配置仍能加载更新后的图片', async () => {
  mockQuery.mockResolvedValueOnce(response('updated'));
  await act(async () => {
    await page.reloadConfig();
  });
  expect(
    Array.from(container.querySelectorAll('img')).map((image) =>
      image.getAttribute('src'),
    ),
  ).toEqual([
    '/poster-updated.jpg',
    '/banner-updated.jpg',
    '/fanart-updated.jpg',
  ]);
});
