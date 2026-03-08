import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ChannelDocument = Channel;

export enum ChannelType {
  WEB = 'WEB',
  MOBILE = 'MOBILE',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
}

@Schema({ timestamps: true })
export class Channel {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: Object.values(ChannelType) })
  type: ChannelType;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ChannelSchema = SchemaFactory.createForClass(Channel);