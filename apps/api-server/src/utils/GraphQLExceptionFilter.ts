import { isLaniError, LaniError } from '@/utils/error';
import { applyDecorators, Catch, Logger, UseFilters } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { inspect } from 'util';

@Catch(LaniError)
export class GraphQLExceptionFilter implements GqlExceptionFilter {
  catch(exception: LaniError) {
    return new GraphQLError(
      exception.message,
      undefined,
      undefined,
      undefined,
      undefined,
      exception.originalError,
      exception.extensions,
    );
  }
}

export function LaniFilterGql() {
  return applyDecorators(UseFilters(GraphQLExceptionFilter));
}

export function LaniFilterCron(): MethodDecorator {
  return function (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const logger = this.logger as Logger | undefined;
      try {
        return await originalMethod.apply(this, args);
      } catch (error: unknown) {
        if (!logger) {
          throw error;
        }
        if (isLaniError(error)) {
          logger.error(
            `${error.stack}\n\ninternalInfo = ${inspect(error.internalInfo)}`,
          );
          return;
        } else if (error instanceof Error) {
          logger.error(error.stack || error);
          return;
        }
        logger.error(error);
      }
    };
  };
}
