// dto/create-question.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType, RenderMode, ProcessMode } from '../../../../shared/domain';

class CreateOptionDto {
  @ApiPropertyOptional({ description: 'Existing Option ID to attach' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty()
  @IsString()
  key: string;

  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty()
  @IsString()
  value: string;

  @ApiProperty()
  @IsInt()
  index: number;
}

export class CreateQuestionDto {
  @ApiProperty()
  @IsString()
  questionnaireId: string;

  @ApiProperty()
  @IsString()
  text: string;

  @ApiProperty({
    description: 'List of tags associated with the question',
    type: [String], // Important for Swagger to show an array of strings
    example: ['ai', 'urgent', 'feedback'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiProperty({ enum: QuestionType })
  @IsEnum(QuestionType)
  questionType: QuestionType;

  @ApiProperty({ enum: RenderMode })
  @IsEnum(RenderMode)
  renderMode: RenderMode;

  @ApiProperty({ enum: ProcessMode })
  @IsEnum(ProcessMode)
  processMode: ProcessMode;

  @ApiProperty()
  @IsInt()
  index: number;

  @ApiProperty({default: false})
  @IsBoolean()
  isRequired: boolean;


  @ApiProperty({default: true})
  @IsBoolean()
  isActive: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  optionListId?: string;

  @ApiPropertyOptional({ type: [CreateOptionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  options?: CreateOptionDto[];
}