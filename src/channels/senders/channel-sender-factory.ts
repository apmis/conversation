import { Injectable, NotFoundException } from "@nestjs/common";
import { ChannelSender } from "./channel-sender";
import { NigeriaBulkSmsSender } from "./sms-sender";
import { WhatsappSender } from "./whatsapp-sender";
import { ChannelDomain, ChannelType } from "../../shared/domain";
import { ChannelService } from "../services/channel.service";

@Injectable()
export class ChannelSenderFactory {
  constructor(
    private smsSender: NigeriaBulkSmsSender,
    private whatsappSender: WhatsappSender,
    private channelService: ChannelService
  ) {}

  async getSender(channelId: string): Promise<ChannelSender> {
    const channel = await this.channelService.findbyId(channelId);
    if(!channel) throw new NotFoundException(`Channel is not found - ${channelId}`)
    switch (channel.type) {
      case ChannelType.SMS:
        return this.smsSender;

      case ChannelType.WHATSAPP:
        return this.whatsappSender;

      default:
        throw new Error(`Unsupported channel ${channelId}, ${channel.name} , ${channel.type}`);
    }
  }
}
