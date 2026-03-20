// services/workflow.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Workflow, WorkflowDocument } from '../entities/workflow';
import { WorkflowDomain } from 'src/shared/domain';

@Injectable()
export class WorkflowService {
  constructor(
    @InjectModel(Workflow.name) private workflowModel: Model<WorkflowDocument>,
  ) {}

  async create(data: Partial<Workflow>): Promise<WorkflowDomain> {
    const workflow = new this.workflowModel(data);
    return workflow.save();
  }

  async findById(id: string): Promise<Workflow> {
    const wf = await this.workflowModel.findById(id).exec();
    if (!wf) throw new NotFoundException('Workflow not found');
    return wf;
  }

  async findByCode(code: string): Promise<Workflow> {
    const wf = await this.workflowModel.findOne({ code }).exec();
    if (!wf) throw new NotFoundException('Workflow not found');
    return wf;
  }

  async findAll(): Promise<Workflow[]> {
    return this.workflowModel.find().exec();
  }

  async update(id: string, data: Partial<Workflow>): Promise<Workflow> {
    const wf = await this.workflowModel.findByIdAndUpdate(id, data, { new: true });
    if (!wf) throw new NotFoundException('Workflow not found');
    return wf;
  }
}