import { Option } from '../../modules/conversation/schemas/option.schema';
import { QuestionnaireDomain, QuestionDomain, OptionDomain } from '../domain';
import { Question } from '../../modules/conversation/schemas/question.schema';
import { Types } from 'mongoose';

export function mapQuestionEntityToDomain(question: Question): QuestionDomain {
  return {
    ...question,
    id: question._id.toString(),
    options: question.options?.map(mapOptionEntityToDomain) || [],
    questionnaireId: question.questionnaireId.toString(),
    optionListId: question.optionListId?.toString(),
    createdAt: question.createdAt || new Date()
  };
}


export function mapOptionEntityToDomain(option: Option): OptionDomain {
  return {
    id: option._id?.toString(),
    ...option
  };
}

/**
 * Converts a QuestionDomain object to a plain object suitable
 * for Mongoose create/update operations.
 */
export function mapQuestionDomainToShcema({id, ...question}: QuestionDomain): Question{
  const schema: any = {
    ...question,
    _id: new Types.ObjectId(id),
    options: question.options?.map((option) => ({_id: new Types.ObjectId(option.id), ...option})),
    questionnaireId: new Types.ObjectId(question.questionnaireId),
  };
  if (question.optionListId) {
    schema.optionListId = new Types.ObjectId(question.optionListId);
  }
  return schema;

}