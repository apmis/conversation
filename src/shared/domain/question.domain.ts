import { AIQuestionConfig } from "./ai-question-config";
import { ProcessMode, QuestionType, RenderMode } from "./enums";
import { QuestionOption } from "./option.domain";
import { ValidationRule } from "./validation-rule.domain";

export type Question = {
  id?: string;
  questionnaireId: string;

  text: string;
  description?: string;

  questionType: QuestionType;
  renderMode: RenderMode;
  processMode: ProcessMode;

  index: number;
  isRequired: boolean;
  tags: string[];

  // Navigation
  previousQuestionId?: string;
  nextQuestionId?: string;
  childQuestionnaireId?: string;

  // Options (for choice questions)
  options?: QuestionOption[];

    // OptionGroup (get choice questions from options table)
  optionListId?: string;

  // AI configuration (if AI_PROCESSED)
  aiConfig?: AIQuestionConfig;

  // Validation rules
  validationRules?: ValidationRule[];

  // Runtime flags
  isActive: boolean;

  // Metadata for extensibility
  metadata?: Record<string, any>;

  createdAt: Date;
  updatedAt?: Date;
};
