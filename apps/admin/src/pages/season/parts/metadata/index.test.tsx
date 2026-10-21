jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useApolloClient: () => ({ query: jest.fn() }),
}));
jest.mock('../../help', () => ({
  formItemProps: {},
  useSeasonPageContext: () => ({ id: 1 }),
}));
jest.mock('@/components/StoredImage', () => () => null);

import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { Form, FormInstance } from 'antd';
import Metadata from './index';
import { MetadataSource } from '@/generated/types';

let container: HTMLDivElement;
let form: FormInstance;
const aliases = ['中文标题', 'Original', '別名'];
function Harness({ values }: { values: object }) {
  [form] = Form.useForm();
  return (
    <Form
      form={form}
      initialValues={{
        infoSource: MetadataSource.BgmCn,
        bangumiId: '1',
        ...values,
      }}
    >
      <Metadata />
    </Form>
  );
}
function render(values: object) {
  act(() => {
    ReactDOM.render(<Harness values={values} />, container);
  });
}
function field() {
  return Array.from(container.querySelectorAll('.ant-form-item')).find(
    (item) =>
      item.querySelector('.ant-form-item-label')?.textContent === '别名',
  )!;
}
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

it('在简介与标签之间显示禁用多行输入框，过滤主标题且不修改数据', () => {
  render({ title: '中文标题', aliases });
  const labels = Array.from(
    container.querySelectorAll('.ant-form-item-label'),
  ).map((el) => el.textContent);
  const index = labels.indexOf('别名');
  expect(labels.slice(index - 1, index + 2)).toEqual(['简介', '别名', '标签']);
  const textarea = field().querySelector('textarea')!;
  expect(textarea.disabled).toBe(true);
  expect(textarea.value).toBe('Original\n別名');
  expect(form.getFieldValue('aliases')).toEqual(aliases);
});

it.each([[], ['中文标题'], undefined])(
  '没有可显示别名时使用普通文字“无”：%j',
  (value) => {
    render({ title: '中文标题', aliases: value });
    expect(field().querySelector('textarea')).toBeNull();
    expect(field().querySelector('.ant-typography')?.textContent).toBe('无');
  },
);

it('标题修改、重置和元数据刷新后重新过滤', () => {
  render({ title: '中文标题', aliases });
  act(() => {
    form.setFieldsValue({ title: 'Original' });
  });
  expect(field().querySelector('textarea')?.value).toBe('中文标题\n別名');
  act(() => {
    form.resetFields();
  });
  expect(field().querySelector('textarea')?.value).toBe('Original\n別名');
  act(() => {
    form.setFieldsValue({ aliases: ['中文标题'] });
  });
  expect(field().querySelector('textarea')).toBeNull();
  act(() => {
    form.setFieldsValue({ aliases: ['中文标题', '新别名'] });
  });
  expect(field().querySelector('textarea')?.value).toBe('新别名');
});
