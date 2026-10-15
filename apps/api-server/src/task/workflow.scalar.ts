import { GraphQLScalarType, valueFromASTUntyped } from 'graphql';
import { parseWorkflow } from '@lani/workflow';

export const WorkflowScalar = new GraphQLScalarType({
  name: 'Workflow',
  description: '版本化的任务流程快照；协议由 @lani/workflow 定义。',
  serialize: parseWorkflow,
  parseValue: parseWorkflow,
  parseLiteral: (node) => parseWorkflow(valueFromASTUntyped(node)),
});
