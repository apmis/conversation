import { Injectable } from '@nestjs/common';
import { ChannelProcessor } from './channel.processor';
import { ConversationService } from '../../modules/conversation/services/conversation.service';
import { ChannelService } from '../services/channel.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WhatsappProcessor implements ChannelProcessor {
  constructor(private channelService: ChannelService, private conversationService: ConversationService, private configService: ConfigService){}
  async processInbound(payload: any) {
    const message = payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    const phone = payload?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.wa_id;
    const channel = await this.channelService.findbyId(this.configService.getOrThrow('CHANNEL_ID_WHATSAPP'))
    const response =  this.conversationService.processInboundMessageFromPhoneNumber(channel,phone, message.from, message?.text?.body || '')
  }
}