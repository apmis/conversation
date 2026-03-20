import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';

import { EventBusService } from './services/event-bus.service';
import { WorkflowEngineService } from './services/workflow-engine.service';
import { TransitionService } from './services/transition.service';
import { StepRunnerService } from './services/step-runner.service';
import { WorkflowSubscriber } from './subscribers/subscriber';
import { WorkflowInstance, WorkflowInstanceSchema } from './entities/instance';
import { Workflow, WorkflowSchema } from './entities/workflow';
import { WorkflowInstanceService } from './services/workflow-instance';
import { WorkflowService } from './services/workflow-service';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    MongooseModule.forFeature([
      { name: Workflow.name, schema: WorkflowSchema },
      { name: WorkflowInstance.name, schema: WorkflowInstanceSchema },
    ]),
  ],
  providers: [
    EventBusService,
    WorkflowEngineService,
    TransitionService,
    StepRunnerService,
    WorkflowInstanceService,
    WorkflowService,
    WorkflowSubscriber,
  ],
  exports: [
    EventBusService,
    WorkflowEngineService,
    WorkflowInstanceService,
    WorkflowService,
  ],
})
export class WorkflowEngineModule {}
