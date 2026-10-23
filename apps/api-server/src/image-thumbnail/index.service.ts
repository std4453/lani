import { QueueConsumer } from '@/background-queue/consumer.decorator';
import { enqueueJobIfAbsent } from '@/background-queue/producer';
import { QueueHandler, QueueJob } from '@/background-queue/types';
import { PrismaService } from '@/common/prisma.service';
import { S3Service } from '@/common/s3.service';
import config from '@/config';
import { Image, Prisma } from '@lani/db';
import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import sharp from 'sharp';

export const THUMBNAIL_QUEUE = 'image-thumbnail';
const MAX_BYTES = 10 * 1024 * 1024;
const TIMEOUT_MS = 30_000;

export function thumbnailKey(source: string) {
  const hash = createHash('sha256').update(source).digest('hex');
  return `thumbnails/v1/${hash}/384.webp`;
}

interface Payload {
  source: string;
}

@Injectable()
@QueueConsumer(THUMBNAIL_QUEUE)
export class ImageThumbnailService implements QueueHandler<Payload> {
  readonly enabled = true;
  readonly retry = { maxAttempts: 3, delayMs: 30_000 };
  private readonly logger = new Logger(ImageThumbnailService.name);

  constructor(private prisma: PrismaService, private s3: S3Service) {}

  async path(
    image: Pick<Image, 'cosPath' | 'thumbnailPath' | 'thumbnailFailedAt'>,
  ) {
    const target = thumbnailKey(image.cosPath);
    if (image.thumbnailPath === target) return target;
    if (!image.thumbnailFailedAt) {
      try {
        await this.prisma.$transaction((tx) => this.enqueue(tx, image.cosPath));
      } catch {
        // 派生图片不可用时继续展示原图，不让整个列表查询失败。
        this.logger.warn('Unable to enqueue image thumbnail');
      }
    }
    return image.cosPath;
  }

  enqueue(tx: Prisma.TransactionClient, source: string) {
    return enqueueJobIfAbsent(tx, THUMBNAIL_QUEUE, thumbnailKey(source), {
      source,
    });
  }

  private read(source: string): Promise<Buffer> {
    const request = this.s3.getObject({
      Bucket: config.s3.bucket,
      Key: source,
    });
    const stream = request.createReadStream();
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      let size = 0;
      const fail = () => {
        clearTimeout(timer);
        reject(new Error('Unable to read thumbnail source'));
        stream.destroy();
        request.abort();
      };
      const timer = setTimeout(fail, TIMEOUT_MS);
      stream.on('data', (chunk: Buffer) => {
        size += chunk.length;
        if (size > MAX_BYTES) fail();
        else chunks.push(chunk);
      });
      stream.once('error', fail);
      stream.once('end', () => {
        clearTimeout(timer);
        resolve(Buffer.concat(chunks));
      });
    });
  }

  async execute(job: QueueJob<Payload>) {
    const { source } = job.payload;
    const target = thumbnailKey(source);
    const image = await this.prisma.image.findFirst({
      where: { cosPath: source },
    });
    // 重启或请求与提交交错时可能再次入队；已完成的对象无需重复转码。
    if (!image || image.thumbnailPath === target || image.thumbnailFailedAt) {
      return async () => {
        // 无业务数据需要更新，队列仍须提交并删除这条重复任务。
      };
    }
    try {
      const input = await this.read(source);
      const output = await sharp(input, { limitInputPixels: 40_000_000 })
        .rotate()
        .resize({ width: 384, withoutEnlargement: true })
        .webp({ quality: 78 })
        .timeout({ seconds: 15 })
        .toBuffer();
      const request = this.s3.putObject({
        Bucket: config.s3.bucket,
        Key: target,
        Body: output,
        ContentType: 'image/webp',
      });
      const timer = setTimeout(() => request.abort(), TIMEOUT_MS);
      try {
        await request.promise();
      } finally {
        clearTimeout(timer);
      }
      return async (tx: Prisma.TransactionClient) => {
        await tx.image.updateMany({
          where: { cosPath: source },
          data: { thumbnailPath: target, thumbnailFailedAt: null },
        });
      };
    } catch {
      if (job.attempts + 1 < this.retry.maxAttempts) {
        throw new Error('Image thumbnail generation failed');
      }
      // 坏图只终止自身的派生任务，不阻塞其他图片。
      this.logger.warn(`Image thumbnail exhausted retries at job ${job.id}`);
      return async (tx: Prisma.TransactionClient) => {
        await tx.image.updateMany({
          where: { cosPath: source },
          data: { thumbnailFailedAt: new Date() },
        });
      };
    }
  }
}
