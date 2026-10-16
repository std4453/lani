jest.mock('@/utils/useApolloPoll', () => ({ useForegroundOnline: () => true }));
import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import TaskScroll from './TaskScroll';

it('仅离开视野的当前步骤在手动滚动停止 5 秒后滚回，关闭时停止', () => {
  jest.useFakeTimers();
  const host = document.createElement('div');
  const render = (active: boolean) =>
    act(() => {
      ReactDOM.render(
        <TaskScroll active={active}>
          <div
            data-current-step="true"
            data-step-id="download"
            data-step-status="running"
          >
            <button aria-expanded="false">已完成步骤</button>
          </div>
        </TaskScroll>,
        host,
      );
    });
  try {
    render(true);
    const container = host.firstElementChild as HTMLElement;
    const current = container.firstElementChild as HTMLElement;
    jest
      .spyOn(container, 'getBoundingClientRect')
      .mockReturnValue({ top: 100, bottom: 300 } as DOMRect);
    const step = jest
      .spyOn(current, 'getBoundingClientRect')
      .mockReturnValue({ top: 400, bottom: 450 } as DOMRect);
    const scrollTo = jest.fn();
    container.scrollTo = scrollTo;
    const tick = (ms: number) =>
      act(() => {
        jest.advanceTimersByTime(ms);
      });
    tick(4000);
    container.dispatchEvent(new Event('scroll'));
    tick(4000);
    expect(scrollTo).not.toHaveBeenCalled();
    tick(1000);
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 292, behavior: 'smooth' });
    step.mockReturnValue({ top: 150, bottom: 180 } as DOMRect);
    tick(6000);
    expect(scrollTo).toHaveBeenCalledTimes(1);
    step.mockReturnValue({ top: 400, bottom: 450 } as DOMRect);
    container.dispatchEvent(new Event('wheel'));
    tick(4500);
    expect(scrollTo).toHaveBeenCalledTimes(1);
    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageUp' }));
    tick(4500);
    expect(scrollTo).toHaveBeenCalledTimes(1);
    tick(500);
    expect(scrollTo).toHaveBeenCalledTimes(2);
    container.querySelector('button')!.click();
    tick(4500);
    expect(scrollTo).toHaveBeenCalledTimes(2);
    tick(500);
    expect(scrollTo).toHaveBeenCalledTimes(3);
    render(false);
    tick(6000);
    expect(scrollTo).toHaveBeenCalledTimes(3);
  } finally {
    act(() => {
      ReactDOM.unmountComponentAtNode(host);
    });
    jest.useRealTimers();
  }
});

it.each(['succeeded', 'failed', 'cancelled'])(
  '终态 %s 不持续滚回，新步骤只定位一次',
  (status) => {
    jest.useFakeTimers();
    const host = document.createElement('div');
    const render = (id: string) =>
      act(() => {
        ReactDOM.render(
          <TaskScroll active>
            <div
              data-current-step="true"
              data-step-id={id}
              data-step-status={status}
            />
          </TaskScroll>,
          host,
        );
      });
    try {
      render('first');
      const container = host.firstElementChild as HTMLElement;
      jest
        .spyOn(container, 'getBoundingClientRect')
        .mockReturnValue({ top: 100, bottom: 300 } as DOMRect);
      jest
        .spyOn(container.firstElementChild!, 'getBoundingClientRect')
        .mockReturnValue({ top: 400, bottom: 450 } as DOMRect);
      container.scrollTo = jest.fn();
      act(() => {
        jest.advanceTimersByTime(6000);
      });
      expect(container.scrollTo).not.toHaveBeenCalled();
      render('second');
      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(container.scrollTo).toHaveBeenCalledTimes(1);
      act(() => {
        jest.advanceTimersByTime(6000);
      });
      expect(container.scrollTo).toHaveBeenCalledTimes(1);
    } finally {
      act(() => {
        ReactDOM.unmountComponentAtNode(host);
      });
      jest.useRealTimers();
    }
  },
);
