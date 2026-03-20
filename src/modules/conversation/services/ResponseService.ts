import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Response } from '../schemas/response.schema';
import { ResponseDirection } from '../../../shared/domain';
import { Question } from '../../questionnaire/schemas/question.schema';
import { Questionnaire } from '../../questionnaire/schemas/questionnaire.schema';

@Injectable()
export class ResponseService {
  private readonly logger = new Logger(ResponseService.name);

  constructor(
    @InjectModel(Response.name)
    private readonly responseModel: Model<Response>,
    @InjectModel(Question.name)
    private readonly questionModel: Model<Question>,
    @InjectModel(Questionnaire.name)
    private readonly questionnaireModel: Model<Questionnaire>,
  ) { }

  async saveInboundResponse(
    conversationId: string,
    participantId: string,
    questionId: string,
    attribute: string,
    message: string,
    valid: boolean,
    metadata?: Record<string, any>,
  ) {
    this.logger.debug(
      `[response:inbound] conversation=${conversationId} question=${attribute} valid=${valid}`,
    );
    return this.responseModel.create({
      conversationId,
      participantId,
      questionId,
      direction: ResponseDirection.INBOUND,
      message,
      textAnswer: message,
      attribute,
      metadata,
      valid,
      timestamp: new Date(),
    });
  }

  async markAsValid(responseId: string): Promise<void> {
    await this.responseModel.findByIdAndUpdate(responseId, { valid: true })
    return;
  }

  async saveOutboundResponse(
    conversationId: string,
    participantId: string,
    questionId: string,
    questionAttribute: string,
    message: string,
    valid: boolean,
    metadata?: Record<string, any>,
  ) {
    this.logger.debug(
      `[response:outbound] conversation=${conversationId} question=${questionAttribute} valid=${valid}`,
    );
    return this.responseModel.create({
      conversationId,
      participantId,
      questionId,
      direction: ResponseDirection.OUTBOUND,
      message,
      textAnswer: message,
      attribute: questionAttribute,
      metadata,
      valid,
      timestamp: new Date(),
    });
  }

  async getValidQuestionnaireResponsesMapByAttribute(questionnaireId: string): Promise<Record<string, any>> {
    this.logger.verbose?.(
      `[response:aggregate] Building valid response map for questionnaire=${questionnaireId}`,
    );
    const persistedQuestions = await this.questionModel
      .find({ questionnaireId: new Types.ObjectId(questionnaireId) })
      .select({ _id: 1 })
      .lean();

    let questionIds = persistedQuestions.map((question) => question._id);

    if (!questionIds.length) {
      const questionnaire = await this.questionnaireModel
        .findById(questionnaireId)
        .select({ questions: 1 })
        .lean();
      questionIds =
        questionnaire?.questions
          ?.map((question: { _id: Types.ObjectId }) => question._id)
          .filter(Boolean) || [];
    }

    if (!questionIds.length) {
      return {};
    }

    const normalizedQuestionIds = questionIds.flatMap((questionId) => [
      questionId,
      questionId.toString(),
    ]);

    const responses = await this.responseModel.find({
      questionId: { $in: normalizedQuestionIds },
      direction: ResponseDirection.INBOUND,
      valid: true,
    });

    this.logger.debug(
      `[response:aggregate] Aggregated ${responses.length} valid inbound responses for questionnaire=${questionnaireId}`,
    );
    return responses.reduce((acc, r) => {
      if (r.attribute) {
        acc[r.attribute] = r.textAnswer ?? r.message;
      }
      return acc;
    }, {} as Record<string, any>);
  }
}
