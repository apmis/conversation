import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendChannelMediaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  channelId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  recipient: string;

  @ApiProperty({ enum: ['document', 'image', 'video', 'audio'] })
  @IsString()
  @IsIn(['document', 'image', 'video', 'audio'])
  documentType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fileName?: string;
}

export class SendChannelMediaFormDto extends SendChannelMediaDto {
  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  file?: any;
}
