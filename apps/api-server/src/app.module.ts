import { CommonModule } from '@/common/index.module';
import config from '@/config';
import { FetchMikanModule } from '@/fetch-mikan/index.module';
import { MikanSyncModule } from '@/mikan-sync/index.module';
import { GraphQLRequestModule } from '@golevelup/nestjs-graphql-request';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    CommonModule,
    FetchMikanModule,
    MikanSyncModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ['./**/*.graphql'],
      autoSchemaFile: true,
      buildSchemaOptions: {
        numberScalarMode: 'integer',
      },
    }),
    ConfigModule.forRoot({
      load: [() => config],
    }),
    ScheduleModule.forRoot(),
    GraphQLRequestModule.forRoot(GraphQLRequestModule, {
      // Exposes configuration options based on the graphql-request package
      endpoint: config.endpoint,
      options: {
        headers: {
          'content-type': 'application/json',
        },
      },
    }),
  ],
})
export class AppModule {}
