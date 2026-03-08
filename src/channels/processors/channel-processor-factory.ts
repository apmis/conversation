import { ChannelType } from "../../shared/domain";
import { ChannelProcessor } from "./channel.processor";
import { SmsProcessor } from "./sms-processor";
import { WhatsappProcessor } from "./whatsapp-processor";

export class ChannelProcessorFactory {
  constructor(
    private smsProcessor: SmsProcessor,
    private whatsappProcessor: WhatsappProcessor,
  ) {}

  getProcessor(channel: string): ChannelProcessor {
    switch (channel) {
      case ChannelType.SMS:
        return this.smsProcessor;

      case ChannelType.WHATSAPP:
        return this.whatsappProcessor;

      default:
        throw new Error(`Unsupported channel ${channel}`);
    }
  }
}