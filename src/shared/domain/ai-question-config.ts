export type AIQuestionConfig = {
  processorId: string;
  promptTemplate?: string;
  outputSchema?: Record<string, any>;
  confidenceThreshold?: number;
};