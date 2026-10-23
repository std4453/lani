jest.mock('@/common/prisma.service', () => ({ PrismaService: class {} }));
jest.mock('@/common/s3.service', () => ({ S3Service: class {} }));
jest.mock('@/config', () => ({
  __esModule: true,
  default: { s3: { bucket: 'images' } },
}));

import sharp from 'sharp';
import {
  ImageThumbnailService,
  thumbnailKey,
  THUMBNAIL_QUEUE,
} from './index.service';
import { enqueueJobIfAbsent } from '@/background-queue/producer';

function setup() {
  const image = {
    cosPath: 'original.jpg',
    thumbnailPath: null,
    thumbnailFailedAt: null,
  };
  const prisma = {
    image: {
      findFirst: jest.fn().mockResolvedValue(image),
      updateMany: jest.fn(),
    },
    backgroundJob: { createMany: jest.fn().mockResolvedValue({ count: 1 }) },
    $transaction: jest.fn(),
  };
  prisma.$transaction.mockImplementation((run) => run(prisma));
  const s3 = { getObject: jest.fn(), putObject: jest.fn() };
  s3.putObject.mockReturnValue({
    promise: jest.fn().mockResolvedValue({}),
    abort: jest.fn(),
  });
  const service = new ImageThumbnailService(prisma as any, s3 as any);
  const job = { id: 1, attempts: 0, payload: { source: image.cosPath } } as any;
  return { image, prisma, s3, service, job };
}

it('enqueues missing thumbnails without waiting for generation and leaves existing jobs untouched', async () => {
  const { image, prisma, s3, service } = setup();
  expect(await service.path(image)).toBe(image.cosPath);
  expect(prisma.backgroundJob.createMany).toHaveBeenCalledWith({
    data: [
      {
        queueName: THUMBNAIL_QUEUE,
        key: thumbnailKey(image.cosPath),
        payload: { source: image.cosPath },
      },
    ],
    skipDuplicates: true,
  });
  expect(s3.getObject).not.toHaveBeenCalled();
  await enqueueJobIfAbsent(prisma as any, THUMBNAIL_QUEUE, 'same', {});
  expect(prisma.backgroundJob.createMany.mock.calls[1][0].skipDuplicates).toBe(
    true,
  );
});

it('returns ready thumbnails and does not enqueue terminal failures until explicitly reset', async () => {
  const { image, prisma, service } = setup();
  const target = thumbnailKey(image.cosPath);
  expect(await service.path({ ...image, thumbnailPath: target })).toBe(target);
  expect(await service.path({ ...image, thumbnailFailedAt: new Date() })).toBe(
    image.cosPath,
  );
  expect(prisma.$transaction).not.toHaveBeenCalled();
  await service.path({ ...image, thumbnailFailedAt: null });
  expect(prisma.$transaction).toHaveBeenCalledTimes(1);
});

it('keeps the original available when enqueueing fails', async () => {
  const { image, prisma, service } = setup();
  prisma.$transaction.mockRejectedValue(new Error('unavailable'));
  expect(await service.path(image)).toBe(image.cosPath);
});

it('generates a real 384px WebP and only publishes its path after upload', async () => {
  const { image, prisma, service, s3, job } = setup();
  const input = await sharp({
    create: { width: 800, height: 1200, channels: 3, background: '#4386af' },
  })
    .jpeg()
    .toBuffer();
  s3.getObject.mockReturnValue({
    promise: jest.fn().mockResolvedValue({ Body: input }),
  });
  const commit = await service.execute(job);
  expect(prisma.image.updateMany).not.toHaveBeenCalled();
  const upload = s3.putObject.mock.calls[0][0];
  expect(upload.Key).toBe(thumbnailKey(image.cosPath));
  expect(upload.ContentType).toBe('image/webp');
  expect(await sharp(upload.Body).metadata()).toMatchObject({
    width: 384,
    height: 576,
    format: 'webp',
  });
  expect(upload.Body.length).toBeLessThan(input.length);
  await commit(prisma as any);
  expect(prisma.image.updateMany).toHaveBeenCalledWith({
    where: { cosPath: image.cosPath },
    data: { thumbnailPath: upload.Key, thumbnailFailedAt: null },
  });
});

it('retries corrupt input then commits failure so the queue can process the next image', async () => {
  const { service, s3, job, prisma, image } = setup();
  s3.getObject.mockImplementation(() => ({
    promise: jest.fn().mockResolvedValue({ Body: Buffer.from('bad image') }),
  }));
  await expect(service.execute(job)).rejects.toThrow(
    'Image thumbnail generation failed',
  );
  const commit = await service.execute({ ...job, attempts: 2 });
  await commit(prisma as any);
  expect(prisma.image.updateMany).toHaveBeenCalledWith({
    where: { cosPath: image.cosPath },
    data: { thumbnailFailedAt: expect.any(Date) },
  });
  expect(s3.putObject).not.toHaveBeenCalled();
});

it('does not publish a thumbnail when storage upload fails', async () => {
  const { service, s3, job, prisma } = setup();
  const input = await sharp({
    create: { width: 10, height: 20, channels: 3, background: 'red' },
  })
    .png()
    .toBuffer();
  s3.getObject.mockReturnValue({
    promise: jest.fn().mockResolvedValue({ Body: input }),
  });
  s3.putObject.mockReturnValue({
    promise: () => Promise.reject(new Error('storage unavailable')),
    abort: jest.fn(),
  });
  await expect(service.execute(job)).rejects.toThrow();
  expect(prisma.image.updateMany).not.toHaveBeenCalled();
});

it('retries failed storage reads without uploading or publishing a thumbnail', async () => {
  const { service, s3, job, prisma } = setup();
  s3.getObject.mockReturnValue({
    promise: jest.fn().mockRejectedValue(new Error('storage unavailable')),
  });
  await expect(service.execute(job)).rejects.toThrow(
    'Image thumbnail generation failed',
  );
  expect(s3.putObject).not.toHaveBeenCalled();
  expect(prisma.image.updateMany).not.toHaveBeenCalled();
});

it.each([undefined, 'not a buffer'])(
  'rejects an invalid storage body: %s',
  async (Body) => {
    const { service, s3, job } = setup();
    s3.getObject.mockReturnValue({
      promise: jest.fn().mockResolvedValue({ Body }),
    });
    await expect(service.execute(job)).rejects.toThrow(
      'Image thumbnail generation failed',
    );
    expect(s3.putObject).not.toHaveBeenCalled();
  },
);

it('generates thumbnails above the former 40 megapixel and 10 MiB limits', async () => {
  const { service, s3, job } = setup();
  const input = await sharp({
    create: { width: 7000, height: 6000, channels: 3, background: 'red' },
  })
    .jpeg()
    .toBuffer();
  s3.getObject.mockReturnValue({
    promise: jest.fn().mockResolvedValue({
      Body: Buffer.concat([input, Buffer.alloc(10 * 1024 * 1024)]),
    }),
  });
  await service.execute(job);
  expect(
    await sharp(s3.putObject.mock.calls[0][0].Body).metadata(),
  ).toMatchObject({
    width: 384,
    format: 'webp',
  });
});

it('skips deleted sources, completed jobs and terminal failures', async () => {
  const { service, s3, job, prisma, image } = setup();
  prisma.image.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({
    ...image,
    thumbnailPath: thumbnailKey(image.cosPath),
  });
  prisma.image.findFirst.mockResolvedValueOnce({
    ...image,
    thumbnailFailedAt: new Date(),
  });
  await service.execute(job);
  await service.execute(job);
  await service.execute(job);
  expect(s3.getObject).not.toHaveBeenCalled();
});
