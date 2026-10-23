import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';

dayjs.extend(customParseFormat);
dayjs.extend(utc);

interface Entry {
  src: string;
  expiresAt: number;
}

const sources = new Map<string, Entry>();
const LIMIT = 512;
const EXPIRY_MARGIN = 30_000;

export function imageSource(src: string) {
  const url = new URL(src, window.location.href);
  const query = url.searchParams;
  let expiresAt = Number(query.get('Expires')) * 1000;
  const date = query.get('X-Amz-Date');
  const duration = Number(query.get('X-Amz-Expires'));
  if (date && duration > 0) {
    // AWS SigV4 使用 UTC 基本格式：yyyyMMdd'T'HHmmss'Z'。
    // https://docs.aws.amazon.com/AmazonS3/latest/developerguide/sigv4-query-string-auth.html
    expiresAt =
      dayjs.utc(date, 'YYYYMMDD[T]HHmmss[Z]', true).valueOf() + duration * 1000;
  }
  // 保留 versionId 等内容参数；签名、响应缓存日期不是图片身份。
  for (const key of [...query.keys()]) {
    if (
      /^(x-amz-|x-oss-)/i.test(key) ||
      /^(AWSAccessKeyId|Signature|Expires|response-expires)$/i.test(key)
    )
      query.delete(key);
  }
  query.sort();
  return { key: url.href, expiresAt };
}

export function cachedImageUrl(src: string, now: number = Date.now()) {
  const { key, expiresAt } = imageSource(src);
  const entry = sources.get(key);
  if (entry && entry.expiresAt > now + EXPIRY_MARGIN) {
    sources.delete(key);
    sources.set(key, entry);
    return entry.src;
  }
  sources.delete(key);
  if (expiresAt > now + EXPIRY_MARGIN) {
    sources.set(key, { src, expiresAt });
    if (sources.size > LIMIT) sources.delete(sources.keys().next().value!);
  }
  return src;
}

export function forgetImageUrl(src: string) {
  const key = imageSource(src).key;
  if (sources.get(key)?.src === src) sources.delete(key);
}

export function clearImageUrls() {
  sources.clear();
}
