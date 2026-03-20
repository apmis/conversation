import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ParticipantRepository } from '../repositories/mongo/participant.repository';
import { ParticipantDomain } from '../../../shared/domain';
import { Types } from 'mongoose';
import { toDomain } from '../../../shared/converters';

@Injectable()
export class ParticipantService {
  private readonly logger = new Logger(ParticipantService.name);

  constructor(private readonly participantRepo: ParticipantRepository) {}

  async createParticipant(participant: ParticipantDomain) {
    this.logger.debug(`[participant:create] Resolving participant phone=${participant.phone || 'n/a'}`);
    const result = await this.participantRepo.findByPhone(participant.phone!);
    if(result) {
      this.logger.verbose(`[participant:create] Reusing existing participant id=${result.id}`);
      return result;
    }
    const schema = await this.participantRepo.create(participant);
    const domain = toDomain(schema);
    this.logger.log(`[participant:create] Created participant id=${domain.id || participant.id}`);
    return domain
  }

   async findOne(id: string) : Promise<ParticipantDomain>{
      this.logger.debug(`[participant:find-one] id=${id}`);
      const participant = await this.participantRepo.findById(id);
        if (!participant) throw new NotFoundException('Participant not found');
      return participant;
    }


   async findByPhone(phone: string) : Promise<ParticipantDomain | null>{
      this.logger.debug(`[participant:find-phone] phone=${phone}`);
      const participant = await this.participantRepo.findByPhone(phone);
      if(!participant) this.createParticipant({
        phone,
        id: new Types.ObjectId().toString()
      })
      return participant;
    }
    

  async getAllParticipants() {
    return this.participantRepo.findAll();
  }

  async updateParticipant(id: string, update: Partial<ParticipantDomain>) {
    const updated = await this.participantRepo.update(id, update);
    if (!updated) throw new NotFoundException('Participant not found');
    return updated;
  }

  async deleteParticipant(id: string) {
    const result = await this.participantRepo.delete(id);
    if (!result.deletedCount) throw new NotFoundException('Participant not found');
    return { success: true };
  }
}
