import { CustomScalar, Scalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('BigInt', () => BigInt)
export class BigIntScalar implements CustomScalar<string, bigint> {
  description = 'BigInt';

  parseValue(value: string): bigint {
    return BigInt(value); // value from the client
  }

  serialize(value: bigint): string {
    return value.toString(10); // value sent to the client
  }

  parseLiteral(ast: ValueNode): bigint {
    if (ast.kind === Kind.STRING) {
      return BigInt(ast.value);
    }
    return null;
  }
}
