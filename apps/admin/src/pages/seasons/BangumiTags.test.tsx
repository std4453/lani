import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import BangumiTags from './BangumiTags';

let container: HTMLDivElement;
let resize: () => void;
let width: number;
const disconnect = jest.fn();
const OriginalResizeObserver = globalThis.ResizeObserver;

beforeEach(() => {
  width = 100;
  disconnect.mockClear();
  globalThis.ResizeObserver = class {
    public constructor(callback: () => void) {
      resize = callback;
    }
    public observe() {}
    public disconnect: typeof disconnect = disconnect;
  } as unknown as typeof ResizeObserver;
  jest
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockImplementation(function (this: HTMLElement) {
      return {
        width:
          this.tagName === 'DIV'
            ? width
            : this.textContent?.startsWith('+')
            ? 24
            : 48,
      } as DOMRect;
    });
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    ReactDOM.unmountComponentAtNode(container);
  });
  container.remove();
  globalThis.ResizeObserver = OriginalResizeObserver;
  jest.restoreAllMocks();
});

const render = (tags: string[]) =>
  act(() => {
    ReactDOM.render(<BangumiTags tags={tags} />, container);
  });
const visible = () =>
  Array.from(container.querySelectorAll('[aria-label="标签"] .ant-tag'))
    .filter((el) => !el.closest('[aria-hidden="true"]'))
    .map((el) => el.textContent);

it('一行溢出显示准确的 +X，宽度变化后恢复或继续折叠', () => {
  render(['甲', '乙', '丙', '丁', '戊']);
  expect(visible()).toEqual(['甲', '+4']);
  expect(
    container.querySelector('[tabindex="0"]')?.getAttribute('aria-label'),
  ).toBe('另有4个标签：乙、丙、丁、戊');
  act(() => {
    width = 65;
    resize();
  });
  expect(visible()).toEqual(['+5']);
  act(() => {
    width = 300;
    resize();
  });
  expect(visible()).toEqual(['甲', '乙', '丙', '丁', '戊']);
});

it('空标签不显示占位，更新结果会重新测量并清理观察器', () => {
  render([]);
  expect(container.textContent).toBe('');
  render(['甲', '乙', '丙', '丁', '戊']);
  expect(visible()).toContain('+4');
  render(['新标签']);
  expect(visible()).toEqual(['新标签']);
  expect(disconnect).toHaveBeenCalledTimes(1);
});
