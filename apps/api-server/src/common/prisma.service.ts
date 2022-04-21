import { ConfigType } from '@/config';
import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
  constructor(configService: ConfigService<ConfigType, true>) {
    super({
      datasources: { db: { url: configService.get('postgresURL') } },
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
