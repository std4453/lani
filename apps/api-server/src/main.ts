import { AppModule } from '@/app.module';
import { GraphQLExceptionFilter } from '@/utils/GraphQLExceptionFilter';
import { NestFactory } from '@nestjs/core';
import { INestApplication, Logger } from '@nestjs/common';
import { MediaStartupService } from '@/media-pool/startup.service';

let app: INestApplication | undefined;
async function fail(error: Error) {
  new Logger('Bootstrap').error(error.message);
  // 文件系统或外部调用可能不响应关闭；限定关闭窗口，不能长期存活在失败状态。
  const deadline = setTimeout(() => process.exit(1), 10000);
  try {
    await app?.close();
  } finally {
    clearTimeout(deadline);
    process.exit(1);
  }
}
async function bootstrap() {
  app = await NestFactory.create(AppModule);
  app.enableShutdownHooks(['SIGINT', 'SIGTERM']);
  app.useGlobalFilters(new GraphQLExceptionFilter());
  const media = app.get(MediaStartupService);
  await media.preflight();
  await app.listen(parseInt(process.env.PORT || '3000'));
  void media.start().catch(fail);
}
void bootstrap().catch(fail);
