import { IsString, IsOptional, IsInt, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOptionDto {
  @ApiProperty({ description: 'Unique key for the option' })
  @IsString()
  key: string;

  @ApiProperty({ description: 'The value of the option' })
  @IsString()
  value: string;

  @ApiProperty({ description: 'Label displayed to the user' })
  @IsString()
  label: string;

  @ApiProperty({ description: 'Order index to sort options', example: 0 })
  @IsInt()
  index: number;

  @ApiProperty({
    description: 'Optional ID of the next question to jump to',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  jumpToQuestionId?: string;

  @ApiProperty({
    description: 'Optional ID of the previous question to go back to',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  backToQuestionId?: string;

  @ApiProperty({
    description: 'Optional ID of a child questionnaire triggered by this option',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  childQuestionnaireId?: string;
}