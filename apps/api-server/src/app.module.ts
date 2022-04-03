import { AdminModule } from '@/admin/index.module';
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
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';
import { SentryModule } from '@ntegral/nestjs-sentry';

@Module({
  imports: [
    CommonModule,
    FetchMikanModule,
    MikanSyncModule,
    SyncModule,
    JobModule,
    AdminModule,
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
    SentryModule.forRoot({
      //dsn: 'https://5f167e91f71f406a9e11a7aebbfcb6d4@o639057.ingest.sentry.io/6292676',
      dsn: 'https://1f3b8d2e87f9423194c36bce2c790d2e@sentry.std4453.com:444/2',
      debug: true,
      environment: 'dev',
      release: 'v0.0.1',
      logLevels: ['log', 'error', 'warn', 'debug'],
      close: {
        enabled: true,
        timeout: 1000,
      },
      sampleRate: 100,
    }),
    EventEmitterModule.forRoot(),
  ],
})
export class AppModule {}
