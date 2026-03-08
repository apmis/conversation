import { Injectable } from "@nestjs/common";
import { ConversationService } from "../../modules/conversation/services/conversation.service";
import { ChannelProcessor } from "./channel.processor";

@Injectable()
export class SmsProcessor implements ChannelProcessor {
  constructor(private conversationService: ConversationService) {}

  async processInbound(payload: any) {
    const {
      from,
      text,
      conversationId,
      participantId,
      questionnaireCode,
      channelId,
    } = payload;

    await this.conversationService.processInboundMessage(
      conversationId,
      text,
      from,
      {
        participantId,
        questionnaireCode,
        channelId,
        channelType: 'sms',
      },
    );
  }

  async fromNigeriaBulkSmsSender() {

  }
}
