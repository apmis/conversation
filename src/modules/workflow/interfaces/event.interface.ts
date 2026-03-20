export interface WorkflowEventPayload {
  [key: string]: any;
}

export interface WorkflowEventContext {
  workflowId?: string;
  workflowInstanceId?: string;
  stepId?: string;
  userId?: string;
  participant?: string;
  value?: string;
}

export interface IWorkflowEvent {
  id: string;
  type: string;
  payload: WorkflowEventPayload;
  context: WorkflowEventContext;
  meta: {
    timestamp: string;
    source?: string;
  };
}
