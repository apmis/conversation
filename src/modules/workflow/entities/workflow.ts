// schemas/workflow.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { WorkflowStep } from './workflow-step';

@Schema({ timestamps: true })
export class Workflow {
  @Prop({ type: Types.ObjectId })
  _id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true })
  code: string;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>; // e.g., description, tags

  @Prop({ type: Array, default: [] })
  steps: WorkflowStep[]; // workflow steps definition (can be objects)

  @Prop({ default: true })
  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export type WorkflowDocument = Workflow & Document;
export const WorkflowSchema = SchemaFactory.createForClass(Workflow);