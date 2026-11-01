import ReactDOM from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import BangumiSearchCard from './BangumiSearchCard';
import { BangumiSearchItem } from './bangumi-search-display';

let container: HTMLDivElement;
const select = jest.fn();
const item: BangumiSearchItem = {
  id: '1',
  name: '芙莉莲',
  aliases: [],
  tags: [],
  platform: 'TV',
  added: false,
  image: '/cover.jpg',
  previewImage: '/large.jpg',
};
function render(value: BangumiSearchItem) {
  act(() => {
    ReactDOM.render(
      <BangumiSearchCard
        item={value}
        keywords="芙利莲"
        selected={false}
        onSelect={select}
      />,
      container,
    );
  });
}
beforeEach(() => {
  select.mockClear();
  container = document.createElement('div');
  document.body.appendChild(container);
});
afterEach(() => {
  act(() => {
    ReactDOM.unmountComponentAtNode(container);
  });
  container.remove();
});
it('已添加项不允许选中，普通项可选中，点击封面不会选中卡片', () => {
  render({ ...item, added: true });
  act(() => Simulate.click(container.querySelector('button')!));
  expect(select).not.toHaveBeenCalled();
  render(item);
  act(() => Simulate.click(container.querySelector('img')!));
  expect(select).not.toHaveBeenCalled();
  act(() => Simulate.click(container.querySelector('button')!));
  expect(select).toHaveBeenCalledWith(item);
});
it('封面失败移除损坏图片并保留占位，不显示失败文字或重试，换图恢复加载', () => {
  render(item);
  const image = container.querySelector('img')!;
  expect(image.style.opacity).toBe('0');
  act(() => Simulate.error(image));
  expect(container.querySelector('img')).toBeNull();
  expect(container.textContent).not.toMatch(/加载失败|重新加载|重试/);
  render({ ...item, image: '/new-cover.jpg' });
  const next = container.querySelector('img')!;
  act(() => Simulate.load(next));
  expect(next.style.opacity).toBe('1');
  expect(container.querySelector('.ant-image-mask')).not.toBeNull();
});

it('选择按钮独立于标题、标签和封面，已添加项使用原生禁用状态', () => {
  render(item);
  const button = container.querySelector('button')!;
  expect(button.type).toBe('button');
  expect(button.disabled).toBe(false);
  expect(button.getAttribute('aria-label')).toBe('选择芙莉莲');
  expect(button.getAttribute('aria-pressed')).toBe('false');
  expect(button.children).toHaveLength(0);
  expect(
    container.querySelector('[aria-label="标签"]')!.closest('button'),
  ).toBeNull();
  expect(container.querySelector('img')!.closest('button')).toBeNull();
  render({ ...item, added: true });
  expect(button.disabled).toBe(true);
  act(() => Simulate.click(button));
  expect(select).not.toHaveBeenCalled();
});

it('没有日期时保留空元素，不插入不换行空格', () => {
  render(item);
  const title = container.querySelector('[title="芙莉莲"]')!;
  expect(title.nextElementSibling!.textContent).toBe('');
  render({ ...item, airDate: '0000-00-00' });
  expect(title.nextElementSibling!.textContent).toBe('');
  render({ ...item, airDate: '2023-09-29' });
  expect(title.nextElementSibling!.textContent).toBe('放送日期：2023-09-29');
});

it('折叠标签独立聚焦，点击或键盘操作不触发卡片选择', () => {
  const originalResizeObserver = globalThis.ResizeObserver;
  globalThis.ResizeObserver = class {
    public observe() {}
    public disconnect() {}
  } as unknown as typeof ResizeObserver;
  jest
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockReturnValue({ width: 30 } as DOMRect);
  try {
    render({ ...item, tags: ['奇幻', '冒险', '旅行'] });
    const more = container.querySelector('[tabindex="0"]')!;
    expect(more.textContent).toBe('+3');
    expect(more.closest('button, [role="button"]')).toBeNull();
    expect(more.getAttribute('aria-label')).toBe(
      '另有3个标签：奇幻、冒险、旅行',
    );
    act(() => {
      Simulate.click(more);
      Simulate.keyDown(more, { key: 'Enter' });
      Simulate.keyDown(more, { key: ' ' });
    });
    expect(select).not.toHaveBeenCalled();
  } finally {
    globalThis.ResizeObserver = originalResizeObserver;
    jest.restoreAllMocks();
  }
});
