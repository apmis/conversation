import { OnEvent } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';
import { WorkflowEngineService } from '../services/workflow-engine.service';
import { type IWorkflowEvent } from '../interfaces/event.interface';

@Injectable()
export class WorkflowSubscriber {
  constructor(private workflowEngine: WorkflowEngineService) {}

  @OnEvent('*', { async: true })
  async handleAllEvents(event: IWorkflowEvent) {
    await this.workflowEngine.handleEvent(event);
  }
}