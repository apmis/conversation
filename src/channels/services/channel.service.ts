import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Channel, ChannelDocument } from "../../modules/conversation/schemas/channel.schema";
import { ChannelDomain, ChannelType } from "../../shared/domain";
import { toDomain } from "../../shared/converters";

@Injectable()
export class ChannelService {
  constructor(
    @InjectModel(Channel.name)
    private channelModel: Model<ChannelDocument>
  ) {}


  async findByType(type: string): Promise<ChannelDomain | null> {
    const result =  this.channelModel.findOne({ type }).exec();
    const domain = toDomain(result);
    return domain;
  }


  async  findbyId(channelId:string): Promise<ChannelDomain> {
    const channel = await this.channelModel.findById(new Types.ObjectId(channelId)).lean();
    return toDomain(channel);
  }

  async validateChannel(channelId: string): Promise<ChannelDomain> {
    const channel = await this.channelModel.findById(channelId).lean();
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    return toDomain(channel);
  }

  async sendMessage(channelId: string, payload: any) {
    const channel = await this.validateChannel(channelId);

    switch (channel.type) {
      case ChannelType.WHATSAPP:
        return this.sendWhatsApp(payload);

      case ChannelType.SMS:
        return this.sendSMS(payload);

      case ChannelType.WEBCHAT:
        return this.sendWebchat(payload);

      default:
        throw new BadRequestException('Unsupported channel');
    }
  }

  private async sendWhatsApp(payload: any) {
    // call whatsapp provider
    return { status: 'sent' };
  }

  private async sendSMS(payload: any) {
    return { status: 'sent' };
  }

  private async sendWebchat(payload: any) {
    return { status: 'sent' };
  }
}