import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { message } from 'antd';
import TaskListUpdateToast from './TaskListUpdateToast';

it('列表提示在独立容器中退场，不关闭其他消息，隐藏期间不可刷新', () => {
  jest.useFakeTimers();
  const container = document.createElement('div');
  const refresh = jest.fn();
  const render = (visible: boolean) =>
    act(() => {
      ReactDOM.render(
        <TaskListUpdateToast
          visible={visible}
          belowBackdrop={!visible}
          onRefresh={refresh}
        />,
        container,
      );
    });
  try {
    act(() => {
      void message.error('保留其他错误提示', 0);
    });
    render(true);
    expect(document.querySelectorAll('.ant-message')).toHaveLength(2);
    const toast = document.querySelector('[role="status"]')!;
    render(false);
    expect(toast.getAttribute('aria-hidden')).toBe('true');
    const button = toast.querySelector('button')!;
    expect(button.disabled).toBe(true);
    button.click();
    expect(refresh).not.toHaveBeenCalled();
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(document.body.contains(toast)).toBe(false);
    expect(document.body.textContent).toContain('保留其他错误提示');

    render(true);
    expect(document.querySelectorAll('.ant-message')).toHaveLength(2);
    render(false);
    act(() => {
      jest.advanceTimersByTime(150);
    });
    render(true);
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(
      document.querySelector('[role="status"]')?.getAttribute('aria-hidden'),
    ).toBe('false');
    expect(document.querySelectorAll('.ant-message')).toHaveLength(2);
  } finally {
    act(() => {
      ReactDOM.unmountComponentAtNode(container);
      message.destroy();
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  }
});
