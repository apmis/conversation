import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { ChannelService } from '../services/channel.service';
import { CreateChannelDto, UpdateChannelDto } from './dto/channel.dto';
import {
  SendChannelMessageDto,
  SendMessageByChannelPathDto,
} from './dto/send-channel-message.dto';
import {
  SendChannelMediaDto,
  SendChannelMediaFormDto,
} from './dto/send-channel-media.dto';
import { ChannelSenderFactory } from '../senders/channel-sender-factory';
import { ParticipantDomain } from '../../shared/domain';

@ApiTags('Channels')
@Controller('channels')
export class ChannelController {
  private readonly logger = new Logger(ChannelController.name);

  constructor(
    private readonly channelService: ChannelService,
    private readonly senderFactory: ChannelSenderFactory,
  ) {}

  @Post()
  create(@Body() dto: CreateChannelDto) {
    this.logger.log(`[channel:create] Creating channel type=${dto.type} name=${dto.name}`);
    return this.channelService.create(dto);
  }

  @Get()
  findAll() {
    return this.channelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.channelService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateChannelDto) {
    return this.channelService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.channelService.remove(id);
  }

  @Post('send-message')
  async sendMessage(@Body() dto: SendChannelMessageDto) {
    this.logger.log(
      `[channel:send-message] channel=${dto.channelId} recipient=${dto.recipient}`,
    );
    const sender = await this.senderFactory.getSender(dto.channelId);
    await sender.sendMessage(
      this.buildDirectParticipant(dto.recipient),
      dto.message,
      dto.previewLink,
      { channelId: dto.channelId, source: 'channel_controller' },
    );

    return { success: true };
  }

  @Post(':channelId/send-message')
  async sendMessageByChannelPath(
    @Param('channelId') channelId: string,
    @Body() dto: SendMessageByChannelPathDto,
  ) {
    this.logger.log(
      `[channel:send-message:path] channel=${channelId} recipient=${dto.recipient}`,
    );
    const sender = await this.senderFactory.getSender(channelId);
    await sender.sendMessage(
      this.buildDirectParticipant(dto.recipient),
      dto.message,
      dto.previewLink,
      { channelId, source: 'channel_controller' },
    );

    return { success: true };
  }

  @Post('send-media')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: SendChannelMediaFormDto })
  @UseInterceptors(FileInterceptor('file'))
  async sendMedia(
    @Body() dto: SendChannelMediaDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    this.logger.log(
      `[channel:send-media] channel=${dto.channelId} recipient=${dto.recipient} file=${dto.fileName || file?.originalname || dto.fileUrl || 'n/a'}`,
    );
    const sender = await this.senderFactory.getSender(dto.channelId);
    if (!sender.sendMedia) {
      throw new BadRequestException('Media sending not supported for this channel');
    }

    if (!file && !dto.fileUrl) {
      throw new BadRequestException('Provide file or fileUrl');
    }

    await sender.sendMedia(this.buildDirectParticipant(dto.recipient), {
      documentType: dto.documentType,
      file,
      fileUrl: dto.fileUrl,
      fileName: dto.fileName || file?.originalname,
      context: { channelId: dto.channelId, source: 'channel_controller' },
    });

    return { success: true };
  }

  private buildDirectParticipant(recipient: string): ParticipantDomain {
    return {
      id: 'direct-send',
      firstName: 'Direct',
      lastName: 'Recipient',
      email: `direct-${recipient}@local.invalid`,
      phone: recipient,
    };
  }
}
