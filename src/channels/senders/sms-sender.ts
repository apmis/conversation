import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { ChannelSender } from './channel-sender';
import { ParticipantDomain } from '../../shared/domain';

@Injectable()
export class NigeriaBulkSmsSender implements ChannelSender {
  private readonly baseUrl =
    'https://portal.nigeriabulksms.com/api/';

  async sendMessage(participant  : ParticipantDomain, message: string): Promise<void> {
    try {
      const params = new URLSearchParams({
        username: process.env.BULKSMS_USERNAME!,
        password: process.env.BULKSMS_PASSWORD!,
        sender: process.env.BULKSMS_SENDER || 'App',
        message,
        mobiles: participant.phone,
      });

      const url = `${this.baseUrl}?${params.toString()}`;

      const res = await axios.get(url);

      if (!res.data || res.data.status !== 'OK') {
        throw new Error('SMS sending failed');
      }
    } catch (err: any) {
      throw new HttpException(
        `BulkSMS error: ${err.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}