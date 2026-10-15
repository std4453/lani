import { DownloadWorkflow } from '@lani/download-workflow';
import {
  Atoms,
  WorkflowDefinition,
  WorkflowRunner,
  WorkflowStore,
} from './workflow-runner';
export interface TaskRuntime {
  start(id: number): Promise<void>;
  stop(): Promise<void>;
  transition(
    id: number,
    change: (workflow: DownloadWorkflow) => DownloadWorkflow,
  ): Promise<void>;
}
export class WorkflowRuntime<D extends WorkflowDefinition>
  implements TaskRuntime
{
  private runner: WorkflowRunner<D>;
  constructor(
    private store: WorkflowStore<D>,
    atoms: Atoms<D>,
    onError: (error: unknown) => void,
  ) {
    this.runner = new WorkflowRunner(store, atoms, onError);
  }
  start(id: number) {
    return this.runner.start(id);
  }
  stop() {
    return this.runner.stop();
  }
  async transition(
    id: number,
    change: (workflow: DownloadWorkflow) => DownloadWorkflow,
  ) {
    for (;;) {
      const job = await this.store.read(id);
      const next = change(job.workflow);
      if (next === job.workflow || (await this.store.commit(job, next))) return;
    }
  }
}
