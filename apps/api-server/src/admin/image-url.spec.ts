import AWS from 'aws-sdk';
import { imageDownloadPath } from './image-url';
import { s3Config } from '../config/types';

describe('image delivery configuration and URLs', () => {
  const credentials = {
    accessKeyId: 'local-test',
    secretAccessKey: 'local-test-secret',
  };
  const key = "folder/封面 !'()+%.png";

  it('defaults to proxy delivery and supports an explicit opt-out', () => {
    expect(s3Config.validate({ bucket: 'images' }).value.proxyEnabled).toBe(
      true,
    );
    expect(
      s3Config.validate({ bucket: 'images', proxyEnabled: false }).value
        .proxyEnabled,
    ).toBe(false);
    expect(
      s3Config.validate({ bucket: 'images', proxyEnabled: 'invalid' }).error,
    ).toBeDefined();
  });

  it.each([true, false])(
    'preserves the signed object path and query (path style: %s)',
    (s3ForcePathStyle) => {
      const s3 = new AWS.S3({
        endpoint: 'http://storage.example:9000',
        region: 'us-east-1',
        signatureVersion: 'v4',
        s3ForcePathStyle,
        credentials,
      });
      const signed = s3.getSignedUrl('getObject', {
        Bucket: 'images',
        Key: key,
      });
      const proxy = new URL(
        imageDownloadPath(signed, key, {
          proxyEnabled: true,
          publicHost: 'https://old-cdn.example/',
        }),
        'https://lani.example',
      );
      const original = new URL(signed);
      expect(
        proxy.pathname.replace(
          '/api/gateway/storage/',
          s3ForcePathStyle ? '/images/' : '/',
        ),
      ).toBe(original.pathname);
      expect(proxy.search).toBe(original.search);
      expect(proxy.origin).toBe('https://lani.example');
    },
  );

  it('preserves legacy signed URLs and publicHost behavior when disabled', () => {
    const signed =
      'http://storage:9000/images/hash.jpg?Signature=a%2Fb%2B&Expires=123';
    expect(imageDownloadPath(signed, 'hash.jpg', { proxyEnabled: false })).toBe(
      signed,
    );
    for (const publicHost of ['https://cdn.example/', '/api/storage/images/']) {
      expect(
        imageDownloadPath(signed, 'hash.jpg', {
          proxyEnabled: false,
          publicHost,
        }),
      ).toBe(`${publicHost}hash.jpg?Signature=a%2Fb%2B&Expires=123`);
    }
  });
});
