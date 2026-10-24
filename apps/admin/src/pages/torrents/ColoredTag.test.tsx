jest.mock('@/theme', () => ({ useTheme: () => ({ theme: 'light' }) }));
import React from 'react';
import ReactDOM from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import ColoredTag from './ColoredTag';

let container: HTMLDivElement;
beforeEach(() => {
  jest.useFakeTimers();
  container = document.createElement('div');
  document.body.appendChild(container);
});
afterEach(() => {
  act(() => {
    ReactDOM.unmountComponentAtNode(container);
  });
  container.remove();
  jest.useRealTimers();
});
it('只在文字实际溢出时显示提示，每次 hover 重新测量', () => {
  act(() => {
    ReactDOM.render(<ColoredTag text="演示制作组" maxWidth={140} />, container);
  });
  const tag = container.querySelector('.ant-tag')!;
  const text = tag.querySelector('span')!;
  Object.defineProperty(text, 'scrollWidth', { configurable: true, value: 60 });
  Object.defineProperty(text, 'clientWidth', { configurable: true, value: 80 });
  const hover = () => {
    act(() => Simulate.mouseEnter(tag));
    act(() => {
      jest.advanceTimersByTime(300);
    });
  };
  const leave = () => {
    act(() => Simulate.mouseLeave(tag));
    act(() => {
      jest.advanceTimersByTime(300);
    });
  };
  hover();
  expect(
    document.querySelector('.ant-tooltip:not(.ant-tooltip-hidden)'),
  ).toBeNull();
  leave();
  Object.defineProperty(text, 'scrollWidth', {
    configurable: true,
    value: 200,
  });
  hover();
  expect(
    document.querySelector('.ant-tooltip:not(.ant-tooltip-hidden)')
      ?.textContent,
  ).toBe('演示制作组');
  leave();
  Object.defineProperty(text, 'clientWidth', {
    configurable: true,
    value: 240,
  });
  hover();
  expect(
    document.querySelector('.ant-tooltip:not(.ant-tooltip-hidden)'),
  ).toBeNull();
});

it('可点击标签支持聚焦查看全文及 Enter、Space 筛选', () => {
  const onClick = jest.fn();
  act(() => {
    ReactDOM.render(
      <ColoredTag text="演示制作组" onClick={onClick} />,
      container,
    );
  });
  const tag = container.querySelector<HTMLElement>('.ant-tag')!;
  expect(tag.getAttribute('role')).toBe('button');
  expect(tag.tabIndex).toBe(0);
  const text = tag.querySelector('span')!;
  Object.defineProperty(text, 'scrollWidth', { value: 200 });
  Object.defineProperty(text, 'clientWidth', { value: 80 });
  act(() => {
    tag.focus();
  });
  act(() => {
    jest.advanceTimersByTime(300);
  });
  expect(document.activeElement).toBe(tag);
  expect(
    document.querySelector('.ant-tooltip:not(.ant-tooltip-hidden)')
      ?.textContent,
  ).toBe('演示制作组');
  act(() => {
    Simulate.keyDown(tag, { key: 'Enter' });
  });
  act(() => {
    Simulate.keyDown(tag, { key: ' ' });
  });
  expect(onClick).toHaveBeenCalledTimes(2);
  act(() => {
    Simulate.keyDown(tag, { key: ' ', repeat: true });
  });
  expect(onClick).toHaveBeenCalledTimes(2);
});

it('普通标签不增加按钮语义或 Tab 停靠点', () => {
  act(() => {
    ReactDOM.render(<ColoredTag text="普通标签" />, container);
  });
  const tag = container.querySelector('.ant-tag')!;
  expect(tag.hasAttribute('role')).toBe(false);
  expect(tag.hasAttribute('tabindex')).toBe(false);
});
