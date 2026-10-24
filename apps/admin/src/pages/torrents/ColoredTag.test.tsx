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
