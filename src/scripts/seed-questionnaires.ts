import { INestApplicationContext } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Question } from '../modules/questionnaire/schemas/question.schema';
import { Questionnaire } from '../modules/questionnaire/schemas/questionnaire.schema';
import {
  SeedQuestionnaire,
  loadQuestionnaireSeeds,
} from './questionnaire-seed-loader';

type SeedResult = {
  created: number;
  updated: number;
  skipped: number;
};

function buildAttribute(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export async function seedQuestionnaires(
  app: INestApplicationContext,
): Promise<SeedResult> {
  console.log('Loading questionnaire seed source...');
  const questionnaireModel = app.get<Model<Questionnaire>>(
    getModelToken(Questionnaire.name),
  );
  const questionModel = app.get<Model<Question>>(getModelToken(Question.name));

  const data = await loadQuestionnaireSeeds(process.cwd());
  console.log(`Loaded ${data.length} questionnaire definitions from seed source.`);
  if (!data.length) {
    return { created: 0, updated: 0, skipped: 0 };
  }

  const questionnaireCodes = data.map((item) => item.code);
  const existingQuestionnaires = await questionnaireModel
    .find({ code: { $in: questionnaireCodes } }, { code: 1 })
    .lean();

  const existingByCode = new Map<string, { id: string }>(
    existingQuestionnaires.map((item: any) => [
      item.code,
      { id: item._id.toString() },
    ]),
  );

  const questionnaireIdByReference = new Map<string, string>();
  const itemsToSync: Array<
    SeedQuestionnaire & {
      generatedId: Types.ObjectId;
      exists: boolean;
    }
  > = [];

  for (const item of data) {
    const existing = existingByCode.get(item.code);
    const generatedId = existing ? new Types.ObjectId(existing.id) : new Types.ObjectId();
    questionnaireIdByReference.set(item.referenceCode, generatedId.toString());
    questionnaireIdByReference.set(item.code, generatedId.toString());
    itemsToSync.push({ ...item, generatedId, exists: Boolean(existing) });
  }

  let created = 0;
  let updated = 0;

  console.log(
    `Syncing ${itemsToSync.length} questionnaires to MongoDB...`,
  );

  for (const item of itemsToSync) {
    const sortedQuestions = [...(item.questions || [])].sort(
      (left, right) => left.index - right.index,
    );

    const questionIdByReference = new Map<string, Types.ObjectId>();
    for (const question of sortedQuestions) {
      questionIdByReference.set(question.referenceCode, new Types.ObjectId());
    }

    const embeddedQuestions = sortedQuestions.map((question) => ({
      _id: questionIdByReference.get(question.referenceCode)!,
      questionnaireId: item.generatedId,
      attribute: question.attribute || buildAttribute(question.text),
      text: question.text,
      description: question.description,
      hasLink: question.hasLink ?? false,
      index: question.index,
      tags: question.tags || [],
      questionType: question.questionType,
      renderMode: question.renderMode,
      processMode: question.processMode,
      isRequired: question.isRequired ?? false,
      isActive: question.isActive ?? true,
      previousQuestionId: question.previousQuestionReferenceCode
        ? questionIdByReference
            .get(question.previousQuestionReferenceCode)
            ?.toString()
        : undefined,
      nextQuestionId: question.nextQuestionReferenceCode
        ? questionIdByReference.get(question.nextQuestionReferenceCode)?.toString()
        : undefined,
      childQuestionnaireId: question.childQuestionnaireReferenceCode
        ? questionnaireIdByReference.get(question.childQuestionnaireReferenceCode)
        : undefined,
      options: [...(question.options || [])]
        .sort((left, right) => left.index - right.index)
        .map((option) => ({
          _id: new Types.ObjectId(),
          key: option.key,
          value: option.value,
          label: option.label,
          index: option.index,
          jumpToQuestionId: option.jumpToQuestionReferenceCode
            ? questionIdByReference
                .get(option.jumpToQuestionReferenceCode)
                ?.toString()
            : undefined,
          backToQuestionId: option.backToQuestionReferenceCode
            ? questionIdByReference
                .get(option.backToQuestionReferenceCode)
                ?.toString()
            : undefined,
          childQuestionnaireId: option.childQuestionnaireReferenceCode
            ? questionnaireIdByReference.get(option.childQuestionnaireReferenceCode)
            : undefined,
          metadata: option.metadata,
        })),
      aiConfig: question.aiConfig,
      validationRules: question.validationRules || [],
      metadata: question.metadata,
    }));

    const startQuestionId = item.startQuestionReferenceCode
      ? questionIdByReference.get(item.startQuestionReferenceCode)?.toString()
      : embeddedQuestions[0]?._id?.toString();

    const questionnairePayload = {
      _id: item.generatedId,
      name: item.name,
      introduction: item.introduction,
      conclusion: item.conclusion,
      code: item.code,
      description: item.description,
      submissionUrl: item.submissionUrl,
      isDynamic: item.isDynamic,
      version: item.version,
      startQuestionId,
      workflowId: item.workflowId,
      endPhrase: item.endPhrase || 'STOP',
      allowBackNavigation: item.allowBackNavigation,
      allowMultipleSessions: item.allowMultipleSessions,
      processingStrategy: item.processingStrategy,
      questions: embeddedQuestions,
      tags: item.tags || [],
      metadata: item.metadata,
      isActive: item.isActive,
    };

    await questionnaireModel.replaceOne(
      { _id: item.generatedId },
      questionnairePayload,
      { upsert: true },
    );

    await questionModel.deleteMany({ questionnaireId: item.generatedId });

    if (embeddedQuestions.length > 0) {
      await questionModel.insertMany(embeddedQuestions, { ordered: true });
    }

    if (item.exists) {
      updated += 1;
    } else {
      created += 1;
    }
  }

  console.log(
    `Questionnaire sync finished. created=${created} updated=${updated}`,
  );

  return { created, updated, skipped: 0 };
}
