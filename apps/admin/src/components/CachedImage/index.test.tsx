import ReactDOM from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import CachedImage from './index';
import { cachedImageUrl, clearImageUrls, imageSource } from './cache';

const expiry = () => Math.floor(Date.now() / 1000) + 3600;
const url = (sig: string, path = 'poster.jpg', expires = expiry()) =>
  `/api/gateway/storage/${path}?AWSAccessKeyId=test&Expires=${expires}&Signature=${sig}`;
let container: HTMLDivElement;
beforeEach(() => {
  clearImageUrls();
  container = document.createElement('div');
  document.body.appendChild(container);
});
afterEach(() => {
  act(() => {
    ReactDOM.unmountComponentAtNode(container);
  });
  container.remove();
});
const render = (src: string, reload = jest.fn()) =>
  act(() => {
    ReactDOM.render(
      <CachedImage
        src={src}
        reload={reload}
        alt="cover"
        fallback={<span>failed</span>}
      />,
      container,
    );
  });

it('keeps the same src across polling and page remounts', () => {
  const first = url('first');
  render(first);
  const img = container.querySelector('img');
  render(url('second'));
  expect(container.querySelector('img')).toBe(img);
  expect(img!.getAttribute('src')).toBe(first);
  act(() => {
    ReactDOM.unmountComponentAtNode(container);
  });
  render(url('third'));
  expect(container.querySelector('img')!.getAttribute('src')).toBe(first);
});

it('updates for an actual image change or a newly available thumbnail', () => {
  render(url('first'));
  const thumbnail = url('next', 'thumbnails/v1/384.webp');
  render(thumbnail);
  expect(container.querySelector('img')!.getAttribute('src')).toBe(thumbnail);
});

it('uses a fresh URL once the previous signature approaches expiry', () => {
  const now = Date.now();
  const first = url('first', 'poster.jpg', Math.floor(now / 1000) + 60);
  expect(cachedImageUrl(first, now)).toBe(first);
  const next = url('next');
  expect(cachedImageUrl(next, now + 40_000)).toBe(next);
});

it('parses v4 signing dates and isolates object versions', () => {
  const first =
    '/storage/p.jpg?X-Amz-Date=20261024T010203Z&X-Amz-Expires=3600&X-Amz-Signature=a&versionId=1';
  expect(imageSource(first).expiresAt).toBe(Date.parse('2026-10-24T02:02:03Z'));
  expect(imageSource(first).key).not.toBe(
    imageSource(first.replace('versionId=1', 'versionId=2')).key,
  );
});

it('bounds the shared cache and isolates backend selection', () => {
  const first = url('first');
  cachedImageUrl(first);
  for (let index = 0; index < 512; index++)
    cachedImageUrl(url('new', `${index}.jpg`));
  expect(cachedImageUrl(url('after-eviction'))).toBe(url('after-eviction'));
  document.cookie = 'lani_backend=offline';
  try {
    expect(cachedImageUrl(url('offline'))).toBe(url('offline'));
  } finally {
    document.cookie = 'lani_backend=; Max-Age=0';
  }
});

it('retries a failed URL once through the existing query callback', async () => {
  const reload = jest.fn().mockResolvedValue(url('fresh'));
  render(url('old'), reload);
  await act(async () => {
    Simulate.error(container.querySelector('img')!);
  });
  expect(reload).toHaveBeenCalledTimes(1);
  expect(container.querySelector('img')!.getAttribute('src')).toBe(
    url('fresh'),
  );
  await act(async () => {
    Simulate.error(container.querySelector('img')!);
  });
  expect(reload).toHaveBeenCalledTimes(1);
  expect(container.textContent).toBe('failed');
});

it('ignores a retry that completes after unmounting', async () => {
  let done!: (src: string) => void;
  render(
    url('old'),
    jest.fn(
      () =>
        new Promise<string>((resolve) => {
          done = resolve;
        }),
    ),
  );
  act(() => {
    Simulate.error(container.querySelector('img')!);
  });
  act(() => {
    ReactDOM.unmountComponentAtNode(container);
  });
  await act(async () => {
    done(url('late'));
  });
  expect(container.innerHTML).toBe('');
});
