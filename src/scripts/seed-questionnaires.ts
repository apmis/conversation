import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { INestApplicationContext } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Questionnaire } from '../modules/conversation/schemas/questionnaire.schema';
import { Question } from '../modules/conversation/schemas/question.schema';
import { OptionList } from '../modules/conversation/schemas/option-list.schema';

type SeedOption = {
  key: string;
  value: string;
  label: string;
  index: number;
  jumpToQuestionId?: string;
  backToQuestionId?: string;
  childQuestionnaireId?: string;
  metadata?: Record<string, any>;
};

type SeedQuestion = {
  text: string;
  questionType: string;
  renderMode: string;
  processMode: string;
  index: number;
  isRequired?: boolean;
  isActive?: boolean;
  tags?: string[];
  options?: SeedOption[];
};

type SeedQuestionnaire = {
  isDynamic: boolean;
  version: number;
  allowBackNavigation: boolean;
  allowMultipleSessions: boolean;
  processingStrategy: string;
  isActive: boolean;
  name: string;
  code: string;
  description?: string;
  introduction?: string;
  conclusion?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  questions?: SeedQuestion[];
};

export async function seedQuestionnaires(
  app: INestApplicationContext,
): Promise<{ created: number; skipped: number }> {
  const questionnaireModel = app.get<Model<Questionnaire>>(
    getModelToken(Questionnaire.name),
  );
  const questionModel = app.get<Model<Question>>(
    getModelToken(Question.name),
  );
  const optionListModel = app.get<Model<OptionList>>(
    getModelToken(OptionList.name),
  );

  const seedPath = join(process.cwd(), 'seedquestionnaire.ai');
  let raw: string;
  try {
    raw = await readFile(seedPath, 'utf-8');
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      return { created: 0, skipped: 0 };
    }
    throw error;
  }

  const data = JSON.parse(raw) as SeedQuestionnaire[];

  let created = 0;
  let skipped = 0;

  for (const item of data) {
    const existing = await questionnaireModel.findOne({ code: item.code }).lean();
    if (existing) {
      skipped += 1;
      continue;
    }

    const { questions = [], ...questionnairePayload } = item;

    const questionnaire = await questionnaireModel.create({
      ...questionnairePayload,
      questions: [],
    });

    const questionnaireId = questionnaire._id as Types.ObjectId;
    const createdQuestions: any[] = [];

    for (const question of questions) {
      const useOptionList = Array.isArray(question.options) && question.options.length > 0 && question.index % 2 === 0;

      let optionListId: Types.ObjectId | undefined;
      let embeddedOptions = question.options || [];

      if (useOptionList) {
        const optionListName = `${item.code}-Q${question.index}`;
        let optionList = await optionListModel.findOne({ name: optionListName });

        if (!optionList) {
          optionList = await optionListModel.create({
            name: optionListName,
            options: question.options,
            tags: [item.code, 'seeded'],
            metadata: {
              questionnaireCode: item.code,
              questionIndex: question.index,
            },
          });
        }

        optionListId = optionList._id as Types.ObjectId;
        embeddedOptions = [];
      }

      const createdQuestion = await questionModel.create({
        _id: new Types.ObjectId(),
        questionnaireId,
        optionListId,
        text: question.text,
        questionType: question.questionType,
        renderMode: question.renderMode,
        processMode: question.processMode,
        index: question.index,
        isRequired: question.isRequired ?? false,
        isActive: question.isActive ?? true,
        tags: question.tags || [],
        options: embeddedOptions,
      });

      createdQuestions.push(createdQuestion.toObject());
    }

    if (createdQuestions.length > 0) {
      await questionnaireModel.updateOne(
        { _id: questionnaireId },
        { $set: { questions: createdQuestions } },
      );
    }

    created += 1;
  }

  return { created, skipped };
}
