/** 只在 S3 已验证请求成功后使用；不能据此绕过存储鉴权。 */
export function imageCacheControl(url: string, now = Date.now()): string {
  const query = new URL(url, "http://gateway.invalid").searchParams;
  let expires = Number(query.get("Expires")) * 1000;
  const date = query.get("X-Amz-Date");
  const duration = Number(query.get("X-Amz-Expires"));
  if (date && /^\d{8}T\d{6}Z$/.test(date) && duration > 0) {
    const iso = date.replace(
      /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,
      "$1-$2-$3T$4:$5:$6Z"
    );
    expires = Date.parse(iso) + duration * 1000;
  }
  const maxAge = Math.min(3600, Math.floor((expires - now) / 1000));
  return Number.isFinite(maxAge) && maxAge > 0
    ? `private, max-age=${maxAge}`
    : "no-store";
}
