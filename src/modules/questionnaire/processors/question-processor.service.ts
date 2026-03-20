import { Injectable } from '@nestjs/common';
import {
  ConversationDomain,
  ProcessMode,
  QuestionDomain,
  QuestionType,
  ValidationRule,
} from '../../../shared/domain';
import { AIProcessorService } from './ai-processor.service';
export type ProcessAnswerResult =
  | {
      status: ProcessAnswerStatus.VALIDATION_ERROR;
      value: string;
      message: string;
    }
  | {
      status: ProcessAnswerStatus.NEXT_QUESTION;
      nextQuestion: QuestionDomain;
      processedAnswer: unknown;
      aiMetadata?: Record<string, any>;
    }
  | {
      status: ProcessAnswerStatus.COMPLETED;
      processedAnswer: unknown;
      aiMetadata?: Record<string, any>;
    };

export enum ProcessAnswerStatus {
  PROCESSING_ERROR = 'PROCESSING_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NEXT_QUESTION = 'NEXT_QUESTION',
  COMPLETED = 'COMPLETED',
  CONVERSATION_NOT_FOUND = "CONVERSATION_NOT_FOUND",
  PARTICIPANT_NOT_FOUND='PARTICIPANT_NOT_FOUND',
  QUESTIONNAIRE_NOT_FOUND = 'QUESTIONNAIRE_NOT_FOUND',
  QUESTIONNAIRE_CODE_NOT_PROVIDED = 'QUESTIONNAIRE_CODE_NOT_PROVIDED',
  CONVERSATION_NOT_FOUND_FOR_SOME_REASON = 'CONVERSATION_NOT_FOUND_FOR_SOME_REASON',
}
@Injectable()
export class QuestionProcessorService {
  constructor(private readonly aiProcessor: AIProcessorService) {}

  askQuestion(question: QuestionDomain) {
      let message = question.text;
      if (question.options?.length) {
        const options = question.options
          .map((option) => `${option.key}: ${option.label}`)
          .join('\n');

        message = `${message}\n${options}`;
      }
      return message;
  }
  async processAnswer(
    conversation: ConversationDomain,
    question: QuestionDomain,
    message: string,
  ): Promise<ProcessAnswerResult> {
    const validationMessage = await this.validateAnswer(question, message);
    if (validationMessage) {
      return { value: message.trim(), status: ProcessAnswerStatus.VALIDATION_ERROR, message: validationMessage };
    }

    const modeResult = await this.processByMode(question, message);
    if (modeResult.validationMessage) {
      return { value: message.trim(), status: ProcessAnswerStatus.VALIDATION_ERROR, message: modeResult.validationMessage };
    }

    const nextQuestion = this.resolveNextQuestion(
      conversation,
      question,
      modeResult.nextQuestionId,
    );

    if (!nextQuestion) {
      return {
        status: ProcessAnswerStatus.COMPLETED,
        processedAnswer: modeResult.processedAnswer,
        aiMetadata: modeResult.aiMetadata,
      };
    }

    return {
      status: ProcessAnswerStatus.NEXT_QUESTION,
      nextQuestion,
      processedAnswer: modeResult.processedAnswer,
      aiMetadata: modeResult.aiMetadata,
    };
  }

  private async validateAnswer(question: QuestionDomain, message: string): Promise<string | null> {
    const answer = message?.trim() ?? '';

    if (question.isRequired && !answer) {
      return 'This question requires an answer.';
    }

    for (const rule of question.validationRules ?? []) {
      const ruleError = await this.applyRule(answer, rule);
      if (ruleError) return ruleError;
    }

    return null;
  }

  private async applyRule(value: string, rule: ValidationRule): Promise<string | null> {
    switch (rule.type) {
      case 'required':
        if (!value) return rule.message || 'This field is required.';
        return null;
      case 'min': {
        if (value.length < Number(rule.value ?? 0)) {
          return rule.message || `Minimum length is ${rule.value}.`;
        }
        return null;
      }
      case 'max': {
        if (value.length > Number(rule.value ?? Number.MAX_SAFE_INTEGER)) {
          return rule.message || `Maximum length is ${rule.value}.`;
        }
        return null;
      }
      case 'regex': {
        if (!rule.value) return null;
        const pattern = new RegExp(String(rule.value));
        if (!pattern.test(value)) {
          return rule.message || 'Input does not match the expected format.';
        }
        return null;
      }
      case 'api':
        const message = await this.validateByAPI(rule.value, value);
        return message;
      default:
        return null;
    }
  }

  private validateAnswerByType(
  type: QuestionType,
  value: any,
  options?: string[] // used for choice questions
): boolean {
  const normalizedString = typeof value === 'string' ? value.trim() : value;
  const normalizedOptions = options?.map((option) => option.toLowerCase()) || [];

  switch (type) {
    case QuestionType.TEXT:
    case QuestionType.AI_OPEN:
      return typeof normalizedString === 'string' && normalizedString.length > 0;

    case QuestionType.NUMBER:
      return normalizedString !== '' && !Number.isNaN(Number(normalizedString));

    case QuestionType.DATE:
      return typeof normalizedString === 'string' && !Number.isNaN(Date.parse(normalizedString));

    case QuestionType.BOOLEAN:
      if (typeof value === 'boolean') return true;
      if (typeof normalizedString !== 'string') return false;
      return ['true', 'false', 'yes', 'no', '1', '0'].includes(
        normalizedString.toLowerCase(),
      );

    case QuestionType.SINGLE_CHOICE:
      if (!options || !Array.isArray(options)) return false;
      return (
        typeof normalizedString === 'string' &&
        normalizedOptions.includes(normalizedString.toLowerCase())
      );

    case QuestionType.MULTI_CHOICE:
      if (!options || !Array.isArray(options)) return false;
      if (typeof normalizedString === 'string') {
        return normalizedString
          .split(',')
          .map((item) => item.trim().toLowerCase())
          .every((item) => normalizedOptions.includes(item));
      }
      return (
        Array.isArray(value) &&
        value.every(
          (v) =>
            typeof v === 'string' &&
            normalizedOptions.includes(v.trim().toLowerCase()),
        )
      );

    case QuestionType.FILE:
      return (
        value &&
        typeof value === 'object' &&
        typeof value.url === 'string'
      );

    default:
      return false;
  }
}

private async validateByAPI(api: string, value: string): Promise<string | null> {
    const result = null;
      return result
}

  private async processByMode(
    question: QuestionDomain,
    message: string,
  ): Promise<{
    processedAnswer: unknown;
    nextQuestionId?: string;
    aiMetadata?: Record<string, any>;
    validationMessage?: string;
  }> {
    if(question.processMode === ProcessMode.QUESTION_TYPE) {
     const isValid =  this.validateAnswerByType(question.questionType, message, question.options?.map((opt) => opt.key))
     if(!isValid) {
      return {
          processedAnswer: message.trim(),
          validationMessage: 'Please enter a valid answer: ' + this.askQuestion(question),
        };
     }
    }
    if (question.processMode === ProcessMode.OPTION_PROCESSED) {
      const selectedOption = question.options?.find(
        (option) =>
          option.key.toLowerCase() === message.trim().toLowerCase() ||
          option.label.toLowerCase() === message.trim().toLowerCase(),
      );

      if (!selectedOption) {
        return {
          processedAnswer: message.trim(),
          validationMessage: 'Please select a valid option: ' + this.askQuestion(question),
        };
      }

      return {
        processedAnswer: {
          key: selectedOption.key,
          label: selectedOption.label,
          value: selectedOption.value,
        },
        nextQuestionId: selectedOption.jumpToQuestionId,
      };
    }

    if (question.processMode === ProcessMode.AI_PROCESSED) {
      const aiResult = await this.aiProcessor.analyze(message, question.aiConfig);
      return {
        processedAnswer: aiResult.structuredResult,
        aiMetadata: {
          confidence: aiResult.confidence,
        },
      };
    }

    return {
      processedAnswer: message.trim(),
    };
  }

  private resolveNextQuestion(
    conversation: ConversationDomain,
    currentQuestion: QuestionDomain,
    overriddenNextQuestionId?: string,
  ): QuestionDomain | null {
    const questions = conversation.questions ?? [];
    if (!questions.length) return null;

    const candidateId = overriddenNextQuestionId ?? currentQuestion.nextQuestionId;
    if (candidateId) {
      const nextById = questions.find((question) => question.id === candidateId);
      if (nextById) return nextById;
    }

    const ordered = [...questions].sort((a, b) => a.index - b.index);
    const currentIndex = ordered.findIndex(
      (question) => question.id === currentQuestion.id,
    );
    if (currentIndex < 0 || currentIndex === ordered.length - 1) {
      return null;
    }

    return ordered[currentIndex + 1];
  }
}
