import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Participant {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;


  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;

  createdAt?: Date;
  updatedAt?: Date;
}

export type UserDocument = Participant;
export const ParticipantSchema = SchemaFactory.createForClass(Participant);