import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { ChannelSender } from './channel-sender';
import { ParticipantDomain } from '../../shared/domain';

@Injectable()
export class WhatsappSender implements ChannelSender {
  private readonly baseUrl: string;
  private readonly token: string;

  constructor() {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const apiVersion = process.env.WHATSAPP_API_VERSION || 'v19.0';

    this.token = process.env.WHATSAPP_ACCESS_TOKEN!;

    this.baseUrl = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
  }

  async sendMessage(destination: ParticipantDomain, message: string): Promise<void> {
    try {
      await axios.post(
        this.baseUrl,
        {
          messaging_product: 'whatsapp',
          to: destination.phone,
          type: 'text',
          text: {
            body: message,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error: any) {
      const err = error?.response?.data || error.message;

      throw new HttpException(
        `WhatsApp send failed: ${JSON.stringify(err)}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}