import { CommonModule } from '@/common/index.module';
import config from '@/config';
import { FetchMikanModule } from '@/fetch-mikan/index.module';
import { JobModule } from '@/job/index.module';
import { MikanSyncModule } from '@/mikan-sync/index.module';
import { SyncModule } from '@/sync/index.module';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    CommonModule,
    FetchMikanModule,
    MikanSyncModule,
    SyncModule,
    JobModule,
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: true,
      buildSchemaOptions: {
        numberScalarMode: 'integer',
      },
    }),
    ConfigModule.forRoot({
      load: [() => config],
    }),
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: config.redisHost,
        port: 6379,
        password: config.redisPassword,
      },
    }),
  ],
})
export class AppModule {}
