import type { AtomType } from "./atoms";
import type {
  AtomRegistry,
  StepDefinition,
  Workflow,
  WorkflowStep,
} from "./types";
import { parseWorkflow } from "./schema";

export {
  AtomType,
  Checkpoint,
  AtomCheckpoint,
  EntryCheckpoint,
  atomTypes,
  FileIdentity,
  FileCheckpoint,
} from "./atoms";
export * from "./types";
export { parseWorkflow } from "./schema";

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
): Workflow {
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
export function currentStep(workflow: Workflow): WorkflowStep {
  const step = workflow.steps.find(({ id }) => id === workflow.currentStepId);
  if (!step) throw new Error("任务当前步骤无效");
  return step;
}
export function isActive(workflow: Workflow): boolean {
  return workflow.status === "running" || workflow.status === "cancelling";
}
export function requestCancellation(workflow: Workflow, now: string): Workflow {
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
export function retryWorkflow(workflow: Workflow, now: string): Workflow {
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

export * from "./atoms/batch-import";
