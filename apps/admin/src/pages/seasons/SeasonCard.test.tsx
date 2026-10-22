jest.mock('umi', () => ({
  Link: ({
    to,
    ...props
  }: { to: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={to} {...props} />
  ),
}));
jest.mock('@/components/TaskDetailsDialog', () => ({}));
import ReactDOM from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import { CardSeasonFieldsFragment } from '@/generated/types';
import SeasonCard from './SeasonCard';

let container: HTMLDivElement;
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
const season = (count = 12): CardSeasonFieldsFragment => ({
  id: 8,
  title: '测试季度',
  isMonitoring: false,
  poster: null,
  mainEpisodes: {
    totalCount: count,
    edges: Array.from({ length: count }, (_, i) => ({
      node: {
        id: i + 1,
        title: `第 ${i + 1} 集`,
        numbering: { type: 'episode', number: String(i + 1) },
        jellyfinEpisodeId: null,
        airTime: '2020-01-01T00:00:00Z',
        tasks: { edges: [] },
      },
    })),
  },
});

test('opens an episode without navigating, with grey missing tags when unmonitored', () => {
  const open = jest.fn();
  act(() => {
    ReactDOM.render(
      <SeasonCard season={season()} openEpisode={open} />,
      container,
    );
  });
  const button = container.querySelector('button')!;
  act(() => Simulate.click(button));
  expect(open).toHaveBeenCalledWith(1);
  expect(button.closest('a')).toBeNull();
  expect(button.getAttribute('data-tone')).toBe('gray');
  expect(container.querySelector('a')?.getAttribute('href')).toBe('/season/8');
  expect(container.textContent).toContain('暂无封面');
});

test('shows the latest twelve-episode window, including episodes beyond the old limit', () => {
  act(() => {
    ReactDOM.render(
      <SeasonCard season={season(65)} openEpisode={jest.fn()} />,
      container,
    );
  });
  expect(
    [...container.querySelectorAll('button')].map(
      (button) => button.textContent,
    ),
  ).toEqual(['61', '62', '63', '64', '65']);
  expect(container.textContent).not.toContain('+');
});

test('keeps a thirteen-episode season in one window', () => {
  act(() => {
    ReactDOM.render(
      <SeasonCard season={season(13)} openEpisode={jest.fn()} />,
      container,
    );
  });
  expect(container.querySelectorAll('button')).toHaveLength(13);
});

test('renders a fractional main episode and opens its details, excluding specials', () => {
  const value = season();
  const base = value.mainEpisodes!.edges![0]!.node!;
  value.mainEpisodes!.edges!.push(
    {
      node: {
        ...base,
        id: 65,
        title: '幕间故事',
        numbering: { type: 'episode', number: '6.5' },
      },
    },
    {
      node: {
        ...base,
        id: 99,
        title: '特别篇',
        numbering: { type: 'sp', number: '1' },
      },
    },
  );
  const open = jest.fn();
  act(() => {
    ReactDOM.render(
      <SeasonCard season={value} openEpisode={open} />,
      container,
    );
  });
  const buttons = [...container.querySelectorAll('button')];
  expect(buttons.map((button) => button.textContent)).toEqual([
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '6.5',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
  ]);
  act(() => Simulate.click(buttons[6]));
  expect(open).toHaveBeenCalledWith(65);
  expect(container.textContent).not.toContain('SP');
});

test('replaces failed posters and retries when the signed URL changes', () => {
  const value = {
    ...season(0),
    poster: { id: 1, downloadPath: '/broken.jpg' },
  };
  act(() => {
    ReactDOM.render(
      <SeasonCard season={value} openEpisode={jest.fn()} />,
      container,
    );
  });
  act(() => Simulate.error(container.querySelector('img')!));
  expect(container.querySelector('img')).toBeNull();
  expect(container.textContent).toContain('封面加载失败');
  value.poster.downloadPath = '/fresh.jpg';
  act(() => {
    ReactDOM.render(
      <SeasonCard season={value} openEpisode={jest.fn()} />,
      container,
    );
  });
  expect(container.querySelector('img')?.getAttribute('src')).toBe(
    '/fresh.jpg',
  );
  expect(container.querySelector('[aria-label="逐集状态"]')).toBeNull();
});
