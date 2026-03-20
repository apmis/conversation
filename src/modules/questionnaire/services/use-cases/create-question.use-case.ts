// usecases/create-question.usecase.ts

import { BadRequestException, Injectable } from "@nestjs/common";
import { Types } from "mongoose";
import { ProcessMode, QuestionDomain, QuestionType } from "../../../../shared/domain";
import { mapQuestionDomainToShcema } from "../../../../shared/converters/question-converter";
import { QuestionMongoRepository } from "../../repositories/mongo/question.mongorepo";

@Injectable()
export class CreateQuestionUseCase {
  constructor(
    private readonly questionRepository: QuestionMongoRepository,
    
  ) { }

  async execute(domain: QuestionDomain) {
    // TEXT TYPE
    if (domain.questionType === QuestionType.TEXT) {
      if (domain.options?.length || domain.optionListId) {
        throw new BadRequestException(
          'TEXT questions cannot have options or optionListId',
        );
      }
    }

    // CHOICE TYPES
    if (
      domain.questionType === QuestionType.SINGLE_CHOICE ||
      domain.questionType === QuestionType.MULTI_CHOICE
    ) {
      if (!domain.options?.length && !domain.optionListId) {
        throw new BadRequestException(
          'Choice questions must provide either options or optionListId',
        );
      }
    }

    // AI OPEN TYPE
    if (domain.questionType === QuestionType.AI_OPEN) {
      if (!domain.processMode) {
        throw new BadRequestException(
          'AI_OPEN question must define processMode',
        );
      }

      if (domain.processMode !== ProcessMode.AI_PROCESSED) {
        throw new BadRequestException(
          'AI_OPEN question must use AI_PROCESSED processMode',
        );
      }

      if (domain.options?.length) {
        throw new BadRequestException(
          'AI_OPEN question cannot have options',
        );
      }
    }
    const schema = mapQuestionDomainToShcema({
      ...domain,
      id: domain.id || new Types.ObjectId().toString(),
    });
    // 🔹 Create Question
    const question = await this.questionRepository.create(schema);
    // return created question (schema) back to caller
    return question;
  }
}
