import { Injectable } from '@nestjs/common';
import { AIQuestionConfig } from '../../../shared/domain';

export type AIAnalyzeResult = {
  structuredResult: Record<string, any>;
  confidence?: number;
};

@Injectable()
export class AIProcessorService {
  async analyze(
    message: string,
    aiConfig?: AIQuestionConfig,
  ): Promise<AIAnalyzeResult> {
    const structuredResult: Record<string, any> = {
      rawText: message.trim(),
    };

    return {
      structuredResult,
      confidence: aiConfig?.confidenceThreshold ? 1 : undefined,
    };
  }
}
