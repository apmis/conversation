import { Injectable } from "@nestjs/common";
import { Question } from "../../../shared/domain/question.domain";

@Injectable()
export class AiService {
  async process(question: Question, input: string) {
    // integrate OpenAI / local LLM here
    return {
      processedValue: input,
      confidence: 0.95,
      nextQuestionId: null,
    };
  }
}