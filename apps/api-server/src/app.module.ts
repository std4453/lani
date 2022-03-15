import config from '@/config';
import { FetchMikanModule } from '@/fetch-mikan/index.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';

@Module({
  imports: [
    FetchMikanModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ['./**/*.graphql'],
      autoSchemaFile: true,
    }),
    ConfigModule.forRoot({
      load: [config],
    }),
  ],
})
export class AppModule {}
