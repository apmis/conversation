// response.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from '../../schemas/response.schema';
import { ResponseDomain } from '../../../../shared/domain';
import { toDomain } from '../../../../shared/converters';

@Injectable()
export class ResponseRepository {
  constructor(
    @InjectModel(Response.name) private readonly responseModel: Model<Response>,
  ) {}

  async createResponse(
    conversationId: string,
    userId: string,
    message: string,
    data?: any,
  ): Promise<Response> {
    const response = new this.responseModel({ conversationId, userId, message, data });
    return response.save();
  }

  async findByConversation(conversationId: string): Promise<ResponseDomain[]> {
    const schema = this.responseModel.find({ conversationId }).sort({ createdAt: 1 }).exec();
    return toDomain(schema)
  }

  async findByUser(userId: string): Promise<ResponseDomain[]> {
    const schema =  this.responseModel.find({ userId }).sort({ createdAt: 1 }).exec();
     return toDomain(schema)
  }

  async deleteByConversation(conversationId: string): Promise<{ deletedCount?: number }> {
    const schema =  this.responseModel.deleteMany({ conversationId }).exec();
    return toDomain(schema)
  }

  async updateResponse(responseId: string, update: Partial<ResponseDomain>): Promise<ResponseDomain> {
    const schema = this.responseModel.findByIdAndUpdate(responseId, update, { new: true }).exec();
    return toDomain(schema)
  }
}