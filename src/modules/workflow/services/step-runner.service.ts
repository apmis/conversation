import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class StepRunnerService {
  private logger = new Logger(StepRunnerService.name);

  async runStep(workflowId: string, stepId: string) {
    this.logger.log(`Running step ${stepId} for workflow ${workflowId}`);

    // TODO:
    // - load step definition
    // - execute handler
    // - update workflow instance
  }
}