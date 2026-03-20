import { Option } from '../../modules/questionnaire/schemas/option.schema';
import { QuestionDomain, OptionDomain } from '../domain';
import { Question } from '../../modules/questionnaire/schemas/question.schema';
import { Types } from 'mongoose';
import { AIQuestionConfig } from '../domain/ai-question-config';
import { ValidationRule } from '../domain/validation-rule.domain';

export function mapQuestionEntityToDomain(schema: Question): QuestionDomain {
  const populatedOptionList = schema.optionListId as unknown as
    | { _id?: Types.ObjectId; options?: Option[] }
    | undefined;
  const optionListOptions = populatedOptionList?.options?.map((option) =>
    mapOptionEntityToDomain(option),
  );

  return {
    ...schema,
    id: schema._id.toString(),
    options: schema.optionListId
      ? optionListOptions || []
      : schema.options?.map(mapOptionEntityToDomain) || [],
    aiConfig: schema.aiConfig as AIQuestionConfig | undefined,
    validationRules: schema.validationRules as ValidationRule[] | undefined,
    questionnaireId: schema.questionnaireId.toString(),
    optionListId:
      schema.optionListId instanceof Types.ObjectId
        ? schema.optionListId.toString()
        : populatedOptionList?._id?.toString(),
    createdAt: schema.createdAt || new Date(),
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
    ...(id ? { _id: new Types.ObjectId(id) } : {}),
    options: question.options?.map((option) => ({
      _id: option.id ? new Types.ObjectId(option.id) : new Types.ObjectId(),
      ...option,
    })),
    questionnaireId: new Types.ObjectId(question.questionnaireId),
  };
  if (question.optionListId) {
    schema.optionListId = new Types.ObjectId(question.optionListId);
  }
  return schema;

}
