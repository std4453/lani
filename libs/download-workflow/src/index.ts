/** 流程协议仅包含可序列化的数据，不依赖浏览器、数据库或 NestJS。 */
export const atomTypes = [
  "submitDownload",
  "download",
  "findVideoFile",
  "importFile",
  "writeMetadata",
  "refreshPlayer",
] as const;
export type AtomType = typeof atomTypes[number];
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
export interface FileIdentity {
  dev: number;
  ino: number;
  size: number;
  mtimeMs: number;
}
interface FileCheckpointBase {
  source: string;
  target: string;
  temporary: string;
  strategy: string;
  sourceIdentity: FileIdentity;
  removeSource?: boolean;
}
export type FileCheckpoint = FileCheckpointBase &
  (
    | { phase: "prepared"; stagedIdentity?: undefined }
    | { phase: "staged" | "published"; stagedIdentity: FileIdentity }
  );
export interface Checkpoint {
  submission?: {
    hash: string;
    name?: string;
    phase: "prepared" | "requested" | "confirmed";
  };
  file?: FileCheckpoint;
  refreshStartedAt?: string;
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
export function createWorkflow(
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
  if (!next.cancellation) delete step.checkpoint.refreshStartedAt;
  return next;
}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("任务流程数据无效");
  return value as Record<string, unknown>;
}
function string(value: unknown): string {
  if (typeof value !== "string") throw new Error("任务流程字符串无效");
  return value;
}
function date(value: unknown): string {
  const result = string(value);
  if (!Number.isFinite(Date.parse(result))) throw new Error("任务流程时间无效");
  return result;
}
function optionalDate(value: unknown): string | undefined {
  return value === undefined ? undefined : date(value);
}
function number(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value))
    throw new Error("任务流程数值无效");
  return value;
}
function oneOf<T extends string>(value: unknown, values: readonly T[]): T {
  if (typeof value !== "string" || !values.includes(value as T))
    throw new Error("任务流程枚举无效");
  return value as T;
}
function identity(value: unknown): FileIdentity {
  const v = object(value);
  return {
    dev: number(v.dev),
    ino: number(v.ino),
    size: number(v.size),
    mtimeMs: number(v.mtimeMs),
  };
}
function checkpoint(value: unknown): Checkpoint {
  const v = object(value);
  const result: Checkpoint = {};
  if (v.submission !== undefined) {
    const s = object(v.submission);
    result.submission = {
      hash: string(s.hash),
      phase: oneOf(s.phase, ["prepared", "requested", "confirmed"]),
      ...(s.name === undefined ? {} : { name: string(s.name) }),
    };
  }
  if (v.file !== undefined) {
    const f = object(v.file);
    if (f.removeSource !== undefined && typeof f.removeSource !== "boolean")
      throw new Error("文件清理标志无效");
    const phase = oneOf(f.phase, ["prepared", "staged", "published"]);
    result.file = {
      ...(f.removeSource === undefined
        ? {}
        : { removeSource: f.removeSource as boolean }),
      source: string(f.source),
      target: string(f.target),
      temporary: string(f.temporary),
      strategy: string(f.strategy),
      sourceIdentity: identity(f.sourceIdentity),
      ...(phase === "prepared"
        ? { phase }
        : { phase, stagedIdentity: identity(f.stagedIdentity) }),
    };
  }
  if (v.refreshStartedAt !== undefined)
    result.refreshStartedAt = date(v.refreshStartedAt);
  return result;
}
/** 从不信任的 JSON 重建协议对象，同时拒绝不支持的版本。 */
export function parseWorkflow(value: unknown): DownloadWorkflow {
  const v = object(value);
  if (v.schemaVersion !== 1 || !Array.isArray(v.steps) || !v.steps.length)
    throw new Error("任务流程版本或步骤无效");
  const steps = v.steps.map((raw): WorkflowStep => {
    const s = object(raw);
    const attempt = number(s.attempt);
    if (!Number.isInteger(attempt) || attempt < 0)
      throw new Error("任务尝试编号无效");
    return {
      id: string(s.id),
      atom: oneOf(s.atom, atomTypes),
      title: string(s.title),
      status: oneOf(s.status, [
        "pending",
        "running",
        "cancelling",
        "failed",
        "succeeded",
        "cancelled",
      ]),
      attempt,
      checkpoint: checkpoint(s.checkpoint),
      ...(s.startedAt === undefined
        ? {}
        : { startedAt: optionalDate(s.startedAt) }),
      ...(s.finishedAt === undefined
        ? {}
        : { finishedAt: optionalDate(s.finishedAt) }),
    };
  });
  if (
    steps.some((s) => !s.id) ||
    new Set(steps.map((s) => s.id)).size !== steps.length ||
    new Set(steps.map((s) => s.atom)).size !== steps.length
  )
    throw new Error("任务步骤重复或无效");
  const definitionVersion = number(v.definitionVersion);
  if (!Number.isInteger(definitionVersion) || definitionVersion < 1)
    throw new Error("流程定义版本无效");
  const result: DownloadWorkflow = {
    schemaVersion: 1,
    definitionVersion,
    status: oneOf(v.status, [
      "running",
      "cancelling",
      "failed",
      "succeeded",
      "cancelled",
    ]),
    currentStepId: string(v.currentStepId),
    createdAt: date(v.createdAt),
    steps,
    ...(v.finishedAt === undefined
      ? {}
      : { finishedAt: optionalDate(v.finishedAt) }),
  };
  currentStep(result);
  if (v.publicationClaimed !== undefined) {
    if (typeof v.publicationClaimed !== "boolean")
      throw new Error("任务发布标志无效");
    result.publicationClaimed = v.publicationClaimed;
  }
  if (v.cancellation !== undefined) {
    const c = object(v.cancellation);
    if (!Array.isArray(c.completedAtoms)) throw new Error("任务取消检查点无效");
    result.cancellation = {
      requestedAt: date(c.requestedAt),
      stepId: string(c.stepId),
      completedAtoms: c.completedAtoms.map(string),
    };
    if (
      result.cancellation.stepId !== result.currentStepId ||
      result.status === "running" ||
      result.status === "succeeded"
    )
      throw new Error("任务取消状态无效");
  }
  if (
    (result.status === "cancelling" || result.status === "cancelled") &&
    !result.cancellation
  )
    throw new Error("任务取消意图缺失");
  if (v.error !== undefined) {
    const e = object(v.error);
    result.error = {
      operation: oneOf(e.operation, ["execute", "cancel"]),
      stepId: string(e.stepId),
      message: string(e.message),
      at: date(e.at),
    };
  }
  return result;
}
