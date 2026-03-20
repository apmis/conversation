export type StepTransition = {
  event: string; // e.g. ANSWER_VALID
  condition?: string; // e.g. payload.dose > 400
  nextStepId: string;
};