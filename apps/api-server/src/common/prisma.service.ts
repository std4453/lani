import config from '@/config';
import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaClientOptions } from '@prisma/client/runtime';

const rejectOnNotFound = {
  findUnique: true,
} as const;

@Injectable()
export class PrismaService
  extends PrismaClient<{
    datasources: PrismaClientOptions['datasources'];
    rejectOnNotFound: typeof rejectOnNotFound;
  }>
  implements OnModuleInit
{
  constructor() {
    super({
      datasources: { db: { url: config.postgresUrl } },
      rejectOnNotFound: {
        findUnique: true,
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
