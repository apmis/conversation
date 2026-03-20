import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendChannelMessageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  channelId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  recipient: string;


  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  previewLink: boolean;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class SendMessageByChannelPathDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  recipient: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string;


  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  previewLink: boolean;
}
