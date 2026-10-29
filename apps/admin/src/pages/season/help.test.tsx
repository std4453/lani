const mockQuery = jest.fn();
jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useApolloClient: () => ({ query: mockQuery }),
  useQuery: () => ({}),
}));
jest.mock('@/utils/useApolloPoll', () => ({ useApolloPoll: jest.fn() }));
jest.mock('@/components/StoredImage', () => () => null);

import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { Form } from 'antd';
import { MetadataSource } from '@/generated/types';
import { SeasonPageContext, useSeasonPage } from './help';
import Metadata from './parts/metadata';

let container: HTMLDivElement;
let page: ReturnType<typeof useSeasonPage>;
function Harness() {
  page = useSeasonPage(1);
  return (
    <SeasonPageContext.Provider value={page.values}>
      <ProForm
        formRef={page.formRef}
        initialValues={page.initialValues}
        submitter={false}
      >
        <ProFormText name="title" />
        <Form.List name="downloadSources">
          {(fields) =>
            fields.map((field) => (
              <ProFormText key={field.key} name={[field.name, 'pattern']} />
            ))
          }
        </Form.List>
        <Metadata />
      </ProForm>
    </SeasonPageContext.Provider>
  );
}
function response(aliases: string[]) {
  return {
    data: {
      seasonById: {
        id: 1,
        title: '中文标题',
        aliases,
        tags: [],
        infoSource: MetadataSource.BgmCn,
        bangumiId: '1',
        downloadOffsetHours: 0,
        downloadSourcesBySeasonId: { edges: [] },
      },
    },
  };
}
beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  mockQuery.mockReset();
});
afterEach(() => {
  act(() => {
    ReactDOM.unmountComponentAtNode(container);
  });
  container.remove();
});

it('通过页面查询加载和刷新别名，重置使用最近一次服务端值', async () => {
  mockQuery.mockResolvedValueOnce(response([]));
  await act(async () => {
    ReactDOM.render(<Harness />, container);
  });
  expect(page.formRef.current?.getFieldValue('aliases')).toEqual([]);
  expect(container.querySelector('textarea[aria-label="别名"]')).toBeNull();

  mockQuery.mockResolvedValueOnce(response(['中文标题', '新别名']));
  await act(async () => {
    await page.values.reloadConfig();
  });
  expect(page.formRef.current?.getFieldValue('aliases')).toEqual([
    '中文标题',
    '新别名',
  ]);
  expect(
    (
      container.querySelector(
        'textarea[aria-label="别名"]',
      ) as HTMLTextAreaElement
    )?.value,
  ).toBe('新别名');
  act(() => {
    page.formRef.current?.setFieldsValue({ title: '临时标题' });
    page.values.reset();
  });
  expect(page.formRef.current?.getFieldValue('title')).toBe('中文标题');
  expect(page.formRef.current?.getFieldValue('aliases')).toEqual([
    '中文标题',
    '新别名',
  ]);
  expect(page.values.modified).toBe(false);
});

it('重置还原下载源列表并清除嵌套字段的修改和校验状态', async () => {
  const data = response([]);
  const source = { id: 1, pattern: '%原下载源%', offset: 0 };
  const initialData = {
    data: {
      seasonById: {
        ...data.data.seasonById,
        downloadSourcesBySeasonId: { edges: [{ node: source }] },
      },
    },
  };
  mockQuery.mockResolvedValueOnce(initialData);
  await act(async () => {
    ReactDOM.render(<Harness />, container);
  });
  act(() => {
    page.formRef.current?.setFieldsValue({
      downloadSources: [
        { ...source, pattern: '%临时修改%' },
        { pattern: '%新下载源%', offset: 1 },
      ],
    });
  });
  act(() => {
    page.formRef.current?.setFields([
      {
        name: ['downloadSources', 0, 'pattern'],
        touched: true,
        errors: ['示例校验错误'],
      },
    ]);
    page.updateTouched();
  });
  expect(page.values.modified).toBe(true);
  act(() => {
    page.values.reset();
  });
  expect(page.formRef.current?.getFieldValue('downloadSources')).toEqual([
    source,
  ]);
  expect(
    page.formRef.current?.getFieldError(['downloadSources', 0, 'pattern']),
  ).toEqual([]);
  expect(page.formRef.current?.isFieldsTouched(false)).toBe(false);
  expect(page.values.modified).toBe(false);
});
