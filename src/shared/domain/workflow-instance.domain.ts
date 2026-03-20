import { Types } from 'mongoose';

export type WorkflowStatus = 'ACTIVE' | 'COMPLETED' | 'STOPPED';

export interface WorkflowInstance {
  id: string;
  workflowId: string;
  flowId: string;
  state: Record<string, any>;
  status: WorkflowStatus;
  currentStepId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}