import { StepTransition } from "./step-transition";

export type WorkflowStep = {
  id: string;
  type: 'QUESTIONNAIRE' | 'ACTION' | 'WAIT' | 'END';

  config?: Record<string, any>;

  transitions: StepTransition[];
};