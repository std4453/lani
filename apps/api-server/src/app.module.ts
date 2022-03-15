import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import config from 'src/config';
import { FetchMikanModule } from 'src/fetch-mikan/index.module';

@Module({
  imports: [
    FetchMikanModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ['./**/*.graphql'],
      autoSchemaFile: true,
    }),
    ConfigModule.forRoot({
      load: [() => config],
    }),
  ],
})
export class AppModule {}
