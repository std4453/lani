import { CommonModule } from '@/common/index.module';
import config from '@/config';
import { FetchMikanModule } from '@/fetch-mikan/index.module';
import { MikanSyncModule } from '@/mikan-sync/index.module';
import {
  ApolloDriver,
  ApolloDriverConfig,
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
        host: 'redis-master.lani-offline',
        port: 6379,
      },
    }),
  ],
})
export class AppModule {}
