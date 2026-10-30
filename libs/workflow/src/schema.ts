import * as Joi from "joi";
import { atomTypes, checkpointSchema } from "./atoms";
import type { Workflow, WorkflowStep } from "./types";

const statuses = ["running", "cancelling", "failed", "succeeded", "cancelled"];
const workflowSchema = Joi.object<Workflow>({
  schemaVersion: Joi.valid(1).required(),
  definitionVersion: Joi.number().required(),
  status: Joi.string()
    .valid(...statuses)
    .required(),
  currentStepId: Joi.string().required(),
  createdAt: Joi.string().required(),
  finishedAt: Joi.string(),
  steps: Joi.array()
    .min(1)
    .items(
      Joi.object<WorkflowStep>({
        id: Joi.string().required(),
        atom: Joi.string()
          .valid(...atomTypes)
          .required(),
        title: Joi.string().required(),
        status: Joi.string()
          .valid("pending", ...statuses)
          .required(),
        attempt: Joi.number().required(),
        startedAt: Joi.string(),
        finishedAt: Joi.string(),
        checkpoint: checkpointSchema.required(),
      })
    )
    .required(),
  cancellation: Joi.object({
    requestedAt: Joi.string().required(),
    stepId: Joi.string().required(),
    completedAtoms: Joi.array().items(Joi.string()).required(),
    reason: Joi.string(),
    code: Joi.string(),
  }),
  error: Joi.object({
    operation: Joi.string().valid("execute", "cancel").required(),
    stepId: Joi.string().required(),
    message: Joi.string().allow("").required(),
    at: Joi.string().required(),
  }),
});
/** 系统自产快照只校验协议形状；依赖、唯一性等在创建定义时检查。 */
export function parseWorkflow(value: unknown): Workflow {
  const result = workflowSchema.validate(value, {
    convert: false,
    allowUnknown: true,
  });
  if (result.error)
    throw new Error(`任务流程数据无效：${result.error.message}`);
  if (!result.value.steps.some(({ id }) => id === result.value.currentStepId))
    throw new Error("任务当前步骤无效");
  return result.value;
}
