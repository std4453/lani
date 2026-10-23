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
  if (date && /^\d{8}T\d{6}Z$/.test(date) && duration > 0) {
    expiresAt =
      Date.parse(
        date.replace(
          /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,
          '$1-$2-$3T$4:$5:$6Z',
        ),
      ) +
      duration * 1000;
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
  const backend =
    document.cookie.match(/(?:^|;\s*)lani_backend=([^;]*)/)?.[1] ?? '';
  return { key: `${backend}:${url.href}`, expiresAt };
}

export function cachedImageUrl(src: string, now = Date.now()) {
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
