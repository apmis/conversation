// services/workflow-processor.service.ts
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WorkflowInstanceService } from '../services/workflow-instance';
import { WorkflowService } from '../services/workflow-service';
import { evaluateCondition } from '../utils/condition-evaluator';

@Injectable()
export class WorkflowProcessorService {
  constructor(
    private readonly instanceService: WorkflowInstanceService,
    private readonly workflowService: WorkflowService,
  ) {}

  @OnEvent('ANSWER_VALID')
  async handleAnswerValid(event: { workflowInstanceId: string; payload: any }) {
    const instance = await this.instanceService.update(event.workflowInstanceId, {});
    const workflow = await this.workflowService.findById(instance.workflowId);

    if (!instance.currentStepId) return;
    const step = workflow.steps.find(s => s.id === instance.currentStepId);

    if(!step) return
    const transition = step.transitions.find(t => {
      if (t.event !== 'ANSWER_VALID') return false;
      return !t.condition || evaluateCondition(t.condition, event.payload);
    });

    if (transition) {
      await this.instanceService.update(instance._id.toString(), {
        currentStepId: transition.nextStepId,
        state: {
          ...instance.state,
          ...event.payload,
        },
      });
    }
  }
}
