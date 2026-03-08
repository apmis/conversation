import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from '../schemas/response.schema';
import { ConversationDomain, ResponseDirection } from '../../../shared/domain';

@Injectable()
export class ResponseService {
  constructor(
    @InjectModel(Response.name)
    private readonly responseModel: Model<Response>,
  ) {}

  async saveInboundResponse(
    conversation: ConversationDomain,
    message: string,
    questionId: string,
    aiMetadata?: Record<string, any>,
  ) {
    return this.responseModel.create({
      conversationId: conversation.id,
      userId: conversation.participantId,
      questionId,
      direction: ResponseDirection.INBOUND,
      message,
      textAnswer: message,
      aiMetadata,
      timestamp: new Date(),
    });
  }

  async saveOutboundResponse(
    conversation: ConversationDomain,
    message: string,
    questionId?: string,
    aiMetadata?: Record<string, any>,
  ) {
    return this.responseModel.create({
      conversationId: conversation.id,
      userId: conversation.participantId,
      questionId,
      direction: ResponseDirection.OUTBOUND,
      message,
      textAnswer: message,
      aiMetadata,
      timestamp: new Date(),
    });
  }
}
