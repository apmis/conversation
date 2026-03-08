import { Body, Controller, Post } from '@nestjs/common';
import { ChannelProcessorFactory } from '../processors/channel-processor-factory';
import { ChannelType } from '../../shared/domain';

@Controller('webhooks')
export class ChannelWebhookController {
  constructor(private readonly processorFactory: ChannelProcessorFactory) {}

  @Post('whatsapp')
  async whatsapp(@Body() payload: any) {
    const processor = this.processorFactory.getProcessor(ChannelType.WHATSAPP);
    return processor.processInbound(payload);
  }

  @Post('sms')
  async sms(@Body() payload: any) {
    const processor = this.processorFactory.getProcessor(ChannelType.SMS);
    return processor.processInbound(payload);
  }
}