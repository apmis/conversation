import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Option, OptionSchema } from '../../conversation/schemas/option.schema';

@Schema({ timestamps: true })
export class OptionList {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ type: [OptionSchema], default: [] })
  options: Option[];

   @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;

  createdAt?: Date;
  updatedAt?: Date;
}

export const OptionListSchema = SchemaFactory.createForClass(OptionList);