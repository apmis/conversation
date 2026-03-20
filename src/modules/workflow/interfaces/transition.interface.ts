export interface ITransition {
  fromStepId: string;
  toStepId: string;
  eventType: string;
  condition?: string;
}