/** 流程协议仅包含可序列化的数据，不依赖浏览器、数据库或 NestJS。 */
import * as Joi from "joi";
import { AtomType, Checkpoint, atomTypes, checkpointSchema } from "./atoms";
export {
  AtomType,
  Checkpoint,
  atomTypes,
  FileIdentity,
  FileCheckpoint,
} from "./atoms";
export type WorkflowStatus =
  | "running"
  | "cancelling"
  | "failed"
  | "succeeded"
  | "cancelled";
export type StepStatus = WorkflowStatus | "pending";
export type Wants = readonly (readonly AtomType[])[];
export interface StepDefinition {
  id: string;
  atom: AtomType;
  title: string;
}
export interface WorkflowStep extends StepDefinition {
  status: StepStatus;
  attempt: number;
  startedAt?: string;
  finishedAt?: string;
  checkpoint: Checkpoint;
}
export interface DownloadWorkflow {
  schemaVersion: 1;
  definitionVersion: number;
  status: WorkflowStatus;
  currentStepId: string;
  steps: WorkflowStep[];
  createdAt: string;
  publicationClaimed?: boolean;
  finishedAt?: string;
  cancellation?: {
    requestedAt: string;
    stepId: string;
    completedAtoms: string[];
  };
  error?: {
    operation: "execute" | "cancel";
    stepId: string;
    message: string;
    at: string;
  };
}
export type AtomRegistry = Record<AtomType, { wants: Wants }>;

export function validateDefinition(
  definition: readonly StepDefinition[],
  registry: AtomRegistry
): void {
  if (!definition.length) throw new Error("任务流程不能为空");
  const ids = new Set<string>();
  const atoms = new Set<AtomType>();
  for (const step of definition) {
    if (!step.id || ids.has(step.id))
      throw new Error("任务步骤标识不能为空或重复");
    const atom = registry[step.atom];
    if (!atom) throw new Error(`未知任务原子：${step.atom}`);
    // 现有产物列按原子类型存储，同一流程不能重复使用同一类型。
    if (atoms.has(step.atom)) throw new Error(`任务原子重复：${step.atom}`);
    if (
      !atom.wants.every(
        (group) => group.length && group.some((type) => atoms.has(type))
      )
    ) {
      throw new Error(`步骤「${step.title}」缺少前置步骤或顺序错误`);
    }
    ids.add(step.id);
    atoms.add(step.atom);
  }
}
export function buildWorkflowSnapshot(
  definition: readonly StepDefinition[],
  registry: AtomRegistry,
  now: string,
  definitionVersion = 1
): DownloadWorkflow {
  validateDefinition(definition, registry);
  return {
    schemaVersion: 1,
    definitionVersion,
    status: "running",
    currentStepId: definition[0].id,
    createdAt: now,
    steps: definition.map((step) => ({
      ...step,
      status: "pending",
      attempt: 0,
      checkpoint: {},
    })),
  };
}
export function currentStep(workflow: DownloadWorkflow): WorkflowStep {
  const step = workflow.steps.find(({ id }) => id === workflow.currentStepId);
  if (!step) throw new Error("任务当前步骤无效");
  return step;
}
export function isActive(workflow: DownloadWorkflow): boolean {
  return workflow.status === "running" || workflow.status === "cancelling";
}
export function requestCancellation(
  workflow: DownloadWorkflow,
  now: string
): DownloadWorkflow {
  if (workflow.status === "succeeded") throw new Error("任务已完成");
  if (workflow.cancellation || workflow.status === "cancelled") return workflow;
  const next = parseWorkflow(JSON.parse(JSON.stringify(workflow)));
  next.cancellation = {
    requestedAt: now,
    stepId: next.currentStepId,
    completedAtoms: [],
  };
  next.status = "cancelling";
  delete next.error;
  delete next.finishedAt;
  currentStep(next).status = "cancelling";
  delete currentStep(next).finishedAt;
  for (const step of next.steps) {
    if (step.status === "pending") {
      step.status = "cancelled";
      step.finishedAt = now;
    }
  }
  return next;
}
export function retryWorkflow(
  workflow: DownloadWorkflow,
  now: string
): DownloadWorkflow {
  if (workflow.status !== "failed") return workflow;
  const next = parseWorkflow(JSON.parse(JSON.stringify(workflow)));
  next.status = next.cancellation ? "cancelling" : "running";
  delete next.error;
  delete next.finishedAt;
  const step = currentStep(next);
  step.status = next.cancellation ? "cancelling" : "pending";
  delete step.finishedAt;
  step.startedAt = now;
  return next;
}

const statuses = ["running", "cancelling", "failed", "succeeded", "cancelled"];
const workflowSchema = Joi.object<DownloadWorkflow>({
  schemaVersion: Joi.valid(1).required(),
  definitionVersion: Joi.number().required(),
  status: Joi.string()
    .valid(...statuses)
    .required(),
  currentStepId: Joi.string().required(),
  createdAt: Joi.string().required(),
  finishedAt: Joi.string(),
  publicationClaimed: Joi.boolean(),
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
  }),
  error: Joi.object({
    operation: Joi.string().valid("execute", "cancel").required(),
    stepId: Joi.string().required(),
    message: Joi.string().allow("").required(),
    at: Joi.string().required(),
  }),
});
/** 系统自产快照只校验协议形状；依赖、唯一性等在创建定义时检查。 */
export function parseWorkflow(value: unknown): DownloadWorkflow {
  const result = workflowSchema.validate(value, {
    convert: false,
    allowUnknown: true,
  });
  if (result.error)
    throw new Error(`任务流程数据无效：${result.error.message}`);
  currentStep(result.value);
  return result.value;
}
