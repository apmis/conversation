import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ example: 'urgent' })
  @IsString()
  name: string;
}

export class UpdateTagDto {
  @ApiPropertyOptional({ example: 'important' })
  @IsOptional()
  @IsString()
  name?: string;
}

export class EnsureTagsDto {
  @ApiProperty({
    type: [String],
    example: ['urgent', 'ai', 'feedback'],
  })
  @IsArray()
  @IsString({ each: true })
  tags: string[];
}