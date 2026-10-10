/** Keep the S3 query intact: changing its escaping can invalidate the signature. */
export function imageDownloadPath(
  signedUrl: string,
  key: string,
  options: { proxyEnabled: boolean; publicHost?: string },
): string {
  if (options.proxyEnabled) {
    const encodedKey = key
      .split('/')
      .map((part) =>
        encodeURIComponent(part).replace(
          /[!'()*]/g,
          (character) =>
            `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
        ),
      )
      .join('/');
    return `/api/gateway/storage/${encodedKey}${new URL(signedUrl).search}`;
  }
  // Preserve the existing publicHost contract, including relative all-in-one URLs.
  return options.publicHost
    ? `${options.publicHost}${key}${new URL(signedUrl).search}`
    : signedUrl;
}
