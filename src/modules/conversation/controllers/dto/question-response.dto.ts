import { ApiProperty } from '@nestjs/swagger';
import { QuestionType, RenderMode, ProcessMode } from '../../../../shared/domain/enums';
import { OptionResponseDto } from './option-response.dto';

export class QuestionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  questionnaireId: string;

  @ApiProperty()
  text: string;

  @ApiProperty({ enum: QuestionType })
  questionType: QuestionType;

  @ApiProperty({ enum: RenderMode })
  renderMode: RenderMode;

  @ApiProperty({ enum: ProcessMode })
  processMode: ProcessMode;

  @ApiProperty()
  orderIndex: number;

  @ApiProperty()
  isRequired: boolean;

  @ApiProperty({ type: [OptionResponseDto] })
  options: OptionResponseDto[];
}