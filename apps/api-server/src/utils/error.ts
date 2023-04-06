import { GraphQLError } from 'graphql';

export class LaniError extends GraphQLError {
  public constructor(message: string) {
    super(message, undefined, undefined, undefined, undefined, undefined, {
      code: 'LANI_ERROR',
    });
  }
}
