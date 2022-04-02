import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

export type PartialOutput<
  WorkflowDefinition extends {
    params: unknown;
    steps: {
      [type: string]: {
        output: unknown;
      };
    };
  },
> = {
  [Type in keyof WorkflowDefinition['steps']]?: WorkflowDefinition['steps'][Type]['output'];
};

export type StepCompletion<
  WorkflowDefinition extends {
    params: unknown;
    steps: {
      [type: string]: {
        output: unknown;
      };
    };
  },
> = keyof WorkflowDefinition['steps'];

export type StepInput<
  WorkflowDefinition extends {
    params: unknown;
    steps: {
      [type: string]: {
        output: unknown;
      };
    };
  },
> = {
  id: number;
  params: WorkflowDefinition['params'];
  completion: StepCompletion<WorkflowDefinition>;
  steps: PartialOutput<WorkflowDefinition>;
};

export type WorkflowState<
  WorkflowDefinition extends {
    params: unknown;
    steps: {
      [type: string]: {
        output: unknown;
      };
    };
  },
> = {
  completion: StepCompletion<WorkflowDefinition>;
  steps: PartialOutput<WorkflowDefinition>;
};

export type WorkflowConfig<
  WorkflowDefinition extends {
    params: unknown;
    steps: {
      [id: string]: {
        output: unknown;
      };
    };
  },
> = {
  initialType: keyof WorkflowDefinition['steps'];
  steps: {
    [Type in keyof WorkflowDefinition['steps']]: {
      atom: Atom<WorkflowDefinition, Type>;
      next?: keyof WorkflowDefinition['steps'];
    };
  };
};

export abstract class Atom<
  WorkflowDefinition extends {
    params: unknown;
    steps: {
      [id: string]: {
        output: unknown;
      };
    };
  },
  Type extends keyof WorkflowDefinition['steps'],
> {
  constructor(private emitter: EventEmitter2, private type: Type) {}

  protected jobSuccess(
    id: number,
    output: WorkflowDefinition['steps'][Type]['output'],
  ) {
    this.emitter.emit(
      JOB_STEP_SUCCEED_EVENT,
      new JobStepSucceedEvent<WorkflowDefinition>(id, this.type, {
        [this.type]: output,
      } as PartialOutput<WorkflowDefinition>),
    );
  }

  protected jobFail(id: number, reason: any) {
    this.emitter.emit(
      JOB_STEP_FAIL_EVENT,
      new JobStepFailEvent<WorkflowDefinition>(id, this.type, reason),
    );
  }

  abstract enqueue(id: number, input: StepInput<WorkflowDefinition>);
}

export abstract class AsyncAtom<
  StepDefinition extends {
    params: unknown;
    steps: {
      [id: string]: {
        output: unknown;
      };
    };
  },
  Type extends keyof StepDefinition['steps'],
> extends Atom<StepDefinition, Type> {
  async enqueue(id: number, input: StepInput<StepDefinition>) {
    try {
      const output = await this.run(id, input);
      this.jobSuccess(id, output);
    } catch (error) {
      this.jobFail(id, error);
    }
  }

  abstract run(
    id: number,
    input: StepInput<StepDefinition>,
  ): Promise<StepDefinition['steps'][Type]['output']>;
}

export const JOB_STEP_SUCCEED_EVENT = 'JOB_STEP_SUCCEED';
export const JOB_STEP_FAIL_EVENT = 'JOB_STEP_FAIL';

export class JobStepSucceedEvent<
  WorkflowDefinition extends {
    params: unknown;
    steps: {
      [id: string]: {
        output: unknown;
      };
    };
  },
> {
  constructor(
    public readonly id: number,
    public readonly type: keyof WorkflowDefinition['steps'],
    public readonly result: PartialOutput<WorkflowDefinition>,
  ) {}
}

export class JobStepFailEvent<
  WorkflowDefinition extends {
    params: unknown;
    steps: {
      [id: string]: {
        output: unknown;
      };
    };
  },
> {
  constructor(
    public readonly id: number,
    public readonly type: keyof WorkflowDefinition['steps'],
    public readonly reason: any,
  ) {}
}

export abstract class WorkflowManager<
  WorkflowDefinition extends {
    params: unknown;
    steps: {
      [type: string]: {
        output: unknown;
      };
    };
  },
> {
  constructor(private workflowConfig: WorkflowConfig<WorkflowDefinition>) {}

  @OnEvent(JOB_STEP_SUCCEED_EVENT)
  async handleJobStepSucceedEvent(
    event: JobStepSucceedEvent<WorkflowDefinition>,
  ) {
    const { id, type, result } = event;
    const { next } = this.workflowConfig.steps[type];
    if (next) {
      const input = await this.persistWorkflowState(
        id,
        {
          completion: next,
          steps: result,
        },
        false,
      );
      this.triggerWorkflowStep(input);
    } else {
      await this.persistWorkflowState(
        id,
        {
          completion: type,
          steps: result,
        },
        true,
      );
    }
  }

  @OnEvent(JOB_STEP_FAIL_EVENT)
  async handleJobStepFailEvent(event: JobStepFailEvent<WorkflowDefinition>) {
    const { id, reason } = event;
    await this.persistWorkflowError(id, reason);
  }

  async triggerWorkflow(params: WorkflowDefinition['params']) {
    const stepInput = await this.createWorkflow(
      this.workflowConfig.initialType,
      params,
    );
    this.triggerWorkflowStep(stepInput);
    return stepInput.id;
  }

  triggerWorkflowStep(input: StepInput<WorkflowDefinition>) {
    const { atom } = this.workflowConfig.steps[input.completion];
    atom.enqueue(input.id, input);
  }

  protected abstract createWorkflow(
    completion: StepCompletion<WorkflowDefinition>,
    params: WorkflowDefinition['params'],
  ): Promise<StepInput<WorkflowDefinition>> | StepInput<WorkflowDefinition>;

  protected abstract persistWorkflowState(
    id: number,
    state: WorkflowState<WorkflowDefinition>,
    finished: boolean,
  ): Promise<StepInput<WorkflowDefinition>> | StepInput<WorkflowDefinition>;

  protected abstract persistWorkflowError(
    id: number,
    reason: any,
  ): Promise<void>;
}
