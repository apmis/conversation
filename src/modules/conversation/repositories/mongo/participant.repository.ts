import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Participant } from '../../schemas/participant.schema';
import { ParticipantDomain } from '../../../../shared/domain';
import { toDomain } from '../../../../shared/converters';

@Injectable()
export class ParticipantRepository {
  constructor(
    @InjectModel(Participant.name) private readonly participantModel: Model<Participant>,
  ) {}

  async create(participant: Participant): Promise<ParticipantDomain> {
    const newParticipant = new this.participantModel(participant);
    return newParticipant.save();
  }

  async findById(id: string): Promise<ParticipantDomain | null> {
    return this.participantModel.findById(id).exec();
  }

  async findAll(): Promise<ParticipantDomain[]> {
    return this.participantModel.find().sort({ createdAt: -1 }).exec();
  }

  async update(id: string, update: Partial<ParticipantDomain>): Promise<ParticipantDomain> {
    const schema = this.participantModel.findByIdAndUpdate(id, update, { new: true }).exec();
    return toDomain(schema)
  }

  async delete(id: string): Promise<{ deletedCount?: number }> {
    return this.participantModel.deleteOne({ _id: id }).exec();
  }

  async findByPhone(phone: string): Promise<ParticipantDomain | null> {
    const schema = await this.participantModel.findOne({ phone }).lean();
    return toDomain(schema);
  }

}