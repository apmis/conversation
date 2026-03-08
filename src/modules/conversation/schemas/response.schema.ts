import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Response {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Question', required: true })
  questionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true })
  conversationId: Types.ObjectId;

  @Prop({ type: [String], default: [] }) // multiple answers for multi-choice
  answer?: string[];

  @Prop({ type: String }) // text answer
  textAnswer?: string;

  @Prop({ type: String }) // text answer
  direction?: string;

  @Prop({ type: String })
  message: string;

  @Prop({ type: Object, default: {} })
  aiMetadata?: Record<string, any>; // AI confidence, embeddings, etc.

  @Prop({ type: Date }) 
  timestamp: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export type ResponseDocument = Response;
export const ResponseSchema = SchemaFactory.createForClass(Response);