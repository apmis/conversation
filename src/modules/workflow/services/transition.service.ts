import { Injectable } from '@nestjs/common';
import { ITransition } from '../interfaces/transition.interface';
import { evaluateCondition } from '../utils/condition-evaluator';

@Injectable()
export class TransitionService {
  async getTransitions(
    workflowId: string,
    stepId: string,
    eventType: string,
  ): Promise<ITransition[]> {
    // Replace with DB query
    return mockTransitions.filter(
      (t) => t.fromStepId === stepId && t.eventType === eventType,
    );
  }

  evaluateCondition(condition: string, payload: any): boolean {
    if (!condition) return true;
    return evaluateCondition(condition, payload);
  }
}

const mockTransitions: ITransition[] = [];