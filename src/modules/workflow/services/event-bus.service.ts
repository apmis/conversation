import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IWorkflowEvent } from '../interfaces/event.interface';
import { randomUUID } from 'crypto';

@Injectable()
export class EventBusService {
  constructor(private eventEmitter: EventEmitter2) {}

  emit(type: string, payload: Record<string, any>, context: any = {}) {
    const event: IWorkflowEvent = {
      id: randomUUID(),
      type,
      payload,
      context,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    this.eventEmitter.emit(type, event);
  }
}