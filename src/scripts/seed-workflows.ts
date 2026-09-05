import { INestApplicationContext } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Workflow } from '../modules/workflow/entities/workflow';

type SeedResult = {
  created: number;
  updated: number;
  skipped: number;
};

type SeedWorkflow = {
  _id: Types.ObjectId;
  name: string;
  code: string;
  metadata?: Record<string, any>;
  isActive: boolean;
  steps: Array<{
    id: string;
    type: 'QUESTIONNAIRE' | 'ACTION' | 'WAIT' | 'END';
    config?: Record<string, any>;
    transitions: Array<{
      event: string;
      condition?: string;
      nextStepId: string;
    }>;
  }>;
};



export async function seedWorkflows(
  app: INestApplicationContext,
): Promise<SeedResult> {
  const workflowModel = app.get<Model<Workflow>>(getModelToken(Workflow.name));
  const workflows = sampleWorkflows();

  let created = 0;
  let updated = 0;

  for (const workflow of workflows) {
    const existing = await workflowModel.findOne({ code: workflow.code }).lean();

    await workflowModel.replaceOne(
      { _id: workflow._id },
      workflow,
      { upsert: true },
    );

    if (existing) {
      updated += 1;
    } else {
      created += 1;
    }
  }

  return {
    created,
    updated,
    skipped: 0,
  };
}
