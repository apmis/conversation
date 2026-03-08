import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Tag {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const TagSchema = SchemaFactory.createForClass(Tag);