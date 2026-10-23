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
const render = (src: string) =>
  act(() => {
    ReactDOM.render(
      <CachedImage src={src} alt="cover" fallback={<span>failed</span>} />,
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

it('does not cache malformed or invalid v4 signing dates', () => {
  for (const date of ['20260230T010203Z', '20261024T250203Z', 'not-a-date']) {
    const first = `/storage/p.jpg?X-Amz-Date=${date}&X-Amz-Expires=3600&X-Amz-Signature=a`;
    const next = first.replace('Signature=a', 'Signature=b');
    expect(imageSource(first).expiresAt).toBeNaN();
    expect(cachedImageUrl(first, 0)).toBe(first);
    expect(cachedImageUrl(next, 0)).toBe(next);
  }
});

it('bounds the shared cache', () => {
  const first = url('first');
  cachedImageUrl(first);
  for (let index = 0; index < 512; index++)
    cachedImageUrl(url('new', `${index}.jpg`));
  const next = url('after-eviction');
  expect(cachedImageUrl(next)).toBe(next);
});

it('uses the latest upstream URL when the cached URL fails', () => {
  const first = url('first');
  const latest = url('latest');
  render(first);
  render(latest);
  expect(container.querySelector('img')!.getAttribute('src')).toBe(first);
  act(() => Simulate.error(container.querySelector('img')!));
  expect(container.querySelector('img')!.getAttribute('src')).toBe(latest);
  act(() => Simulate.error(container.querySelector('img')!));
  expect(container.textContent).toBe('failed');
  render(latest);
  expect(container.textContent).toBe('failed');
});

it('waits for new upstream data after failure without retaining the failed URL', () => {
  const first = url('first');
  render(first);
  act(() => Simulate.error(container.querySelector('img')!));
  expect(container.textContent).toBe('failed');
  render(first);
  expect(container.querySelector('img')).toBeNull();
  const latest = url('latest');
  render(latest);
  expect(container.querySelector('img')!.getAttribute('src')).toBe(latest);
});
