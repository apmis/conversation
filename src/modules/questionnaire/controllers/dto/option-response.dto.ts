import { ApiProperty } from '@nestjs/swagger';

export class OptionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  optionKey: string;

  @ApiProperty()
  optionValue: string;

  @ApiProperty()
  label: string;

  @ApiProperty()
  orderIndex: number;
}
