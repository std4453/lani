import config from '@/config';
import { Injectable, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@lani/db';
import { PrismaClientOptions } from '@lani/db/dist/runtime';

const rejectOnNotFound = {
  findUnique: true,
} as const;

@Injectable()
export class PrismaService
  extends PrismaClient<{
    datasources: PrismaClientOptions['datasources'];
    rejectOnNotFound: typeof rejectOnNotFound;
  }>
  implements OnModuleInit, OnApplicationShutdown
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

  async onApplicationShutdown() {
    await this.$disconnect();
  }
}
