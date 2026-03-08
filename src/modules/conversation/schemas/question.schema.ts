// schemas/question.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { QuestionType, RenderMode, ProcessMode } from '../../../shared/domain';
import { Option, OptionSchema } from './option.schema';

@Schema({ timestamps: true })
export class Question {
  @Prop({ type: Types.ObjectId })
  _id: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Questionnaire',
    required: true,
    index: true,
  })
  questionnaireId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'OptionList',
    required: false,
    index: true,
  })
  optionListId?: Types.ObjectId;

  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  index: number;


  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({
    type: String, // 👈 REQUIRED
    required: true,
    enum: Object.values(QuestionType),
  })
  questionType: QuestionType;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(RenderMode),
  }) renderMode: RenderMode;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(ProcessMode),
  })
  processMode: ProcessMode;

  @Prop({ default: false })
  isRequired: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [OptionSchema], default: [] })
  options?: Option[];

  createdAt?: Date;
  updatedAt?: Date;

}

export type QuestionDocument = Question & Document;
export const QuestionSchema = SchemaFactory.createForClass(Question);