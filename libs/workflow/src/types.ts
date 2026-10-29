/** 流程协议仅包含可序列化的数据，不依赖浏览器、数据库或 NestJS。 */
import type { AtomType, Checkpoint } from "./atoms";

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
export interface Workflow {
  schemaVersion: 1;
  definitionVersion: number;
  status: WorkflowStatus;
  currentStepId: string;
  steps: WorkflowStep[];
  createdAt: string;
  finishedAt?: string;
  cancellation?: {
    requestedAt: string;
    stepId: string;
    completedAtoms: string[];
    reason?: string;
    code?: "timeout" | "baha";
  };
  error?: {
    operation: "execute" | "cancel";
    stepId: string;
    message: string;
    at: string;
  };
}
export type AtomRegistry = Record<AtomType, { wants: Wants }>;

/** 供列表展示使用，不包含 checkpoint、路径或错误详情。 */
export interface WorkflowSummary {
  status: WorkflowStatus;
  currentStepId: string;
  steps: {
    id: string;
    atom: string;
    title: string;
    status: StepStatus;
  }[];
}

/** 与 Workflow 一样按 JSON 传输，version 与流程取自同一任务快照。 */
export interface TaskSummary {
  version: number;
  workflow?: WorkflowSummary | null;
  legacy?: {
    stage: string;
    isFailed: boolean;
    isCancelled: boolean;
  } | null;
}
