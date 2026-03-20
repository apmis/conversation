// schemas/workflow-event.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class WorkflowEvent {
  @Prop({ required: true })
  workflowInstanceId: string;

  @Prop({ required: true })
  type: string; // e.g., ANSWER_VALID, QUESTIONNAIRE_COMPLETED

  @Prop({ type: Object, default: {} })
  payload?: Record<string, any>;

  @Prop({ default: false })
  processed: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export type WorkflowEventDocument = WorkflowEvent & Document;
export const WorkflowEventSchema = SchemaFactory.createForClass(WorkflowEvent);