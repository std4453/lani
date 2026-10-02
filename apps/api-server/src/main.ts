import { AppModule } from '@/app.module';
import { GraphQLExceptionFilter } from '@/utils/GraphQLExceptionFilter';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks(['SIGINT', 'SIGTERM']);
  app.useGlobalFilters(new GraphQLExceptionFilter());
  await app.listen(parseInt(process.env.PORT || '3000'));
}
bootstrap();
