import { Injectable, NotFoundException } from '@nestjs/common';
import { ChannelProcessor } from './channel.processor';
import { ConversationService } from '../../modules/conversation/services/conversation.service';
import { ChannelService } from '../services/channel.service';
import { ConfigService } from '@nestjs/config';
import { ExchangeService } from '../services/exchange.service';
import { ChannelType } from '../../shared/domain';
import { WhatsAppWebhookDto } from '../controllers/dto/whatsapp.dto';
import { Types } from 'mongoose';

@Injectable()
export class WhatsappProcessor implements ChannelProcessor {
  constructor(
    private channelService: ChannelService,
    private conversationService: ConversationService,
    private configService: ConfigService,
    private exchangeService: ExchangeService,
  ) {}

  async processInbound(payload: WhatsAppWebhookDto) {

    const statuses = payload?.entry?.[0]?.changes?.[0]?.value?.statuses;

    if(statuses) {
      const exchange = await this.exchangeService.updateExchangeFromWhatsappStatus(payload);
      return exchange;
    }

    const message = payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    const phone = payload?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.wa_id || 'unknown';
    const text = message?.text?.body || '';
    const messageId = message?.id || 'unknown';
    const questionnaireCode = text;
  
    const whatsappChannelId = this.configService.getOrThrow('CHANNEL_ID_WHATSAPP')
    const channel = await this.channelService.findById(whatsappChannelId)
    if (!channel) {
      throw new NotFoundException('Configured WhatsApp channel was not found');
    }

    const exchange = await this.exchangeService.logInbound({
      channelId: channel.id,
      channelType: ChannelType.WHATSAPP,
      sender: phone,
      message: text,
      messageId,
      questionnaireCode,
      metadata: { source: 'whatsapp_webhook' },
      rawPayload: payload,
    });
    return exchange;
  }
}
