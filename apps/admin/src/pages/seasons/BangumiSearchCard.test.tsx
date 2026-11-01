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
  act(() => Simulate.click(container.querySelector('[aria-disabled]')!));
  expect(select).not.toHaveBeenCalled();
  render(item);
  act(() => Simulate.click(container.querySelector('img')!));
  expect(select).not.toHaveBeenCalled();
  act(() => Simulate.click(container.querySelector('[aria-disabled]')!));
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
