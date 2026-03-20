// services/workflow-instance.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkflowInstance, WorkflowInstanceDocument } from '../entities/instance';
import { toDomain } from 'src/shared/converters';
import { WorkflowInstanceDomain } from 'src/shared/domain';

@Injectable()
export class WorkflowInstanceService {
  constructor(
    @InjectModel(WorkflowInstance.name) private instanceModel: Model<WorkflowInstanceDocument>,
  ) {}

  async create(data: Partial<WorkflowInstance>): Promise<WorkflowInstanceDomain> {
    const instance = new this.instanceModel({
      _id: new Types.ObjectId(),
      ...data,
    });
    return toDomain(await instance.save());
  }

  async findById(id: string): Promise<WorkflowInstance> {
    const instance = await this.instanceModel.findById(id).exec();
    if (!instance) throw new NotFoundException('Workflow instance not found');
    return instance;
  }

  async getActiveByConversationId(conversationId: string): Promise<WorkflowInstance> {
    const instance = await this.instanceModel
      .findOne({ flowId: conversationId, status: 'ACTIVE' })
      .exec();
    if (!instance) throw new NotFoundException('Workflow instance not found for conversation');
    return instance;
  }

  async update(id: string, data: Partial<WorkflowInstance>): Promise<WorkflowInstance> {
    const instance = await this.instanceModel.findByIdAndUpdate(id, data, { new: true });
    if (!instance) throw new NotFoundException('Workflow instance not found');
    return instance;
  }
}
