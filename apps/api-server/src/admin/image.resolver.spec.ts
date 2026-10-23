import { ImageResolver } from './image.resolver';
import config from '@/config';
import { S3Service } from '@/common/s3.service';
import { PrismaService } from '@/common/prisma.service';

jest.mock('@/config', () => ({
  __esModule: true,
  default: { s3: { bucket: 'images', proxyEnabled: true } },
}));
jest.mock('@/common/s3.service', () => ({ S3Service: class {} }));
jest.mock('@/image-thumbnail/index.service', () => ({
  ImageThumbnailService: class {},
}));
jest.mock('@/common/prisma.service', () => ({ PrismaService: class {} }));

describe('ImageResolver', () => {
  const nodeId = Buffer.from(JSON.stringify(['images', 7])).toString('base64');
  const signed = 'http://storage:9000/images/hash.jpg?Signature=original';
  const findUnique = jest.fn();
  const getSignedUrlPromise = jest.fn();
  const path = jest.fn();
  const resolver = new ImageResolver(
    { getSignedUrlPromise } as unknown as S3Service,
    { image: { findUnique } } as unknown as PrismaService,
    { path } as any,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    config.s3.proxyEnabled = true;
    config.s3.publicHost = undefined;
    getSignedUrlPromise.mockResolvedValue(signed);
  });

  it('uses the existing object and signature for the same-domain address', async () => {
    findUnique.mockResolvedValue({ cosPath: 'hash.jpg' });
    await expect(resolver.downloadPath({ nodeId })).resolves.toBe(
      '/api/gateway/storage/hash.jpg?Signature=original',
    );
    expect(getSignedUrlPromise).toHaveBeenCalledWith('getObject', {
      Bucket: 'images',
      Key: 'hash.jpg',
      Expires: 3600,
      ResponseCacheControl: 'private',
      ResponseExpires: expect.any(Date),
    });
  });

  it('returns no URL for missing records instead of failing the season query', async () => {
    findUnique.mockResolvedValue(null);
    await expect(resolver.downloadPath({ nodeId })).resolves.toBeUndefined();
    expect(findUnique).toHaveBeenCalledWith({
      where: { id: 7 },
      rejectOnNotFound: false,
    });
    expect(getSignedUrlPromise).not.toHaveBeenCalled();
  });

  it('uses the queued thumbnail selection only for thumbnail requests', async () => {
    findUnique.mockResolvedValue({ cosPath: 'original.jpg' });
    path.mockResolvedValue('thumbnails/v1/384.webp');
    await resolver.downloadPath({ nodeId }, true);
    expect(path).toHaveBeenCalledWith({ cosPath: 'original.jpg' });
    expect(getSignedUrlPromise).toHaveBeenCalledWith(
      'getObject',
      expect.objectContaining({
        Key: 'thumbnails/v1/384.webp',
        Expires: 3600,
      }),
    );
    const expires =
      getSignedUrlPromise.mock.calls[0][1].ResponseExpires.getTime();
    expect(expires - Date.now()).toBeGreaterThan(3598_000);
    expect(expires - Date.now()).toBeLessThanOrEqual(3600_000);
  });

  it('restores the existing all-in-one publicHost when opted out', async () => {
    findUnique.mockResolvedValue({ cosPath: 'hash.jpg' });
    config.s3.proxyEnabled = false;
    config.s3.publicHost = '/api/storage/images/';
    await expect(resolver.downloadPath({ nodeId })).resolves.toBe(
      '/api/storage/images/hash.jpg?Signature=original',
    );
  });
});
