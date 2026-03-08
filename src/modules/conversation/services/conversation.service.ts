import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import {
  ChannelDomain,
  ConversationDomain,
  ConversationState,
  ConversationStatus,
  ParticipantDomain,
  QuestionDomain,
} from '../../../shared/domain';
import { QuestionnaireService } from './questionnaire.service';
import { ChannelSenderFactory } from '../../../channels/senders/channel-sender-factory';
import { ConversationRepository } from '../repositories/mongo/conversation.repository';
import { ResponseService } from './ResponseService';
import { ParticipantService } from './participant.service';
import { ProcessAnswerStatus, QuestionProcessorService } from './question-processor.service';
import { Channel } from '../../../shared/domain/channel.domain';
import { ChannelSender } from '../../../channels/senders/channel-sender';

type InboundMessageContext = {
  participantId?: string;
  questionnaireCode?: string;
  channelId?: string;
  channelType?: string;
};

@Injectable()
export class ConversationService {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly questionnaireService: QuestionnaireService,
    private readonly responseService: ResponseService,
    private readonly participantService: ParticipantService,
    private readonly senderFactory: ChannelSenderFactory,
    private readonly questionProcessor: QuestionProcessorService,
  ) { }

  async create(
    questionnaireId: string,
    channelId: string,
    participantId: string,
    currentQuestionId: string,
    questions?: QuestionDomain[],
  ): Promise<ConversationDomain> {
    const conversation: ConversationDomain = {
      id: new Types.ObjectId().toString(),
      channelId,
      participantId,
      questionnaireId,
      state: ConversationState.START,
      status: ConversationStatus.ACTIVE,
      startedAt: new Date(),
      questions,
    };

    const schema = await this.conversationRepository.create({
      ...conversation,
      currentQuestionId,
    });
    return schema;
  }

  async findActiveConversationOfParticipant(participanctId: string, questionnaireId: string): Promise<ConversationDomain | null> {
    return this.conversationRepository.findActiveByParticipantId(participanctId, questionnaireId);
  }

  private async sendQuestion(
    conversation: ConversationDomain,
    question: QuestionDomain,
  ) {
    const sender: ChannelSender = await this.senderFactory.getSender(conversation.channelId);
    const participant = await this.participantService.findOne(
      conversation.participantId,
    );

    let message = question.text;
    
    if (question.options?.length) {
      const options = question.options
        .map((option) => `${option.key}: ${option.label}`)
        .join('\n');

      message = `${message}\n${options}`;
    }

    await sender.sendMessage(participant, message);
    await this.responseService.saveOutboundResponse(
      conversation,
      message,
      question.id,
    );
  }

  private async sendMessage(
    conversation: ConversationDomain,
    message: string,
    questionId?: string,
  ) {
    const sender = await this.senderFactory.getSender(conversation.channelId);
    const participant = await this.participantService.findOne(
      conversation.participantId,
    );
    await sender.sendMessage(participant, message);
    await this.responseService.saveOutboundResponse(conversation, message, questionId);
  }

  private getCurrentQuestion(conversation: ConversationDomain): QuestionDomain {
    const questions = conversation.questions ?? [];
    const questionId = conversation.currentQuestionId;

    const question = questions.find((item) => item.id === questionId);
    if (!question) {
      throw new NotFoundException('Current question not found for conversation');
    }

    return question;
  }
  async processInboundMessageFromPhoneNumber(channel: ChannelDomain, phone: string, message, questionnaireCode: string, context?: InboundMessageContext,) {
    const participant = await this.participantService.findByPhone(phone);
    return this.processInboundMessage(channel, participant, message, questionnaireCode, context);
  }

  async processInboundMessage(
    channel: ChannelDomain,
    participant: ParticipantDomain,
    message: string,
    questionnaireCode: string,
    context?: InboundMessageContext,
  ) {
    let conversation = await this.conversationRepository.findActiveByParticipantId(
      participant.id,
      questionnaireCode
    );

    if (!conversation) {
      if (!questionnaireCode) {
        throw new BadRequestException(
          'Unable to resolve active conversation and missing bootstrap context',
        );
      }
      const questionnaire = await this.questionnaireService.findByCode(
        questionnaireCode,
      );
      if (!questionnaire) {
        throw new BadRequestException(
          'Unable to find the conversation for session',
        );
      }

      const startQuestion = this.questionnaireService.getStartQuestion(questionnaire);

      conversation = await this.create(questionnaire.id, channel.id, participant.id, startQuestion.id!, questionnaire.questions);

      await this.sendQuestion(conversation, startQuestion);
      const progressedConversation = await this.conversationRepository.save(
        conversation.id!,
        {
          state: ConversationState.PROGRESS,
          currentQuestionId: startQuestion.id,
        } as Partial<ConversationDomain>,
      );
      return progressedConversation;
    }

    if (conversation.status === ConversationStatus.COMPLETED) {
      throw new BadRequestException('Thank you, conversation is completed.');
    }

    const currentQuestion = this.getCurrentQuestion(conversation);

    await this.responseService.saveInboundResponse(
      conversation,
      message,
      currentQuestion.id!,
    );

    const processingResult = await this.questionProcessor.processAnswer(
      conversation,
      currentQuestion,
      message,
    );

    if (processingResult.status === ProcessAnswerStatus.VALIDATION_ERROR) {
      await this.sendMessage(
        conversation,
        processingResult.message,
        currentQuestion.id,
      );
      return conversation;
    }

    if (processingResult.status === ProcessAnswerStatus.COMPLETED) {
      await this.conversationRepository.save(conversation.id!, {
        status: ConversationStatus.COMPLETED,
        state: ConversationState.COMPLETED,
        endedAt: new Date(),
      });
      const questionnaire = await this.questionnaireService.findOne(conversation.questionnaireId)

      await this.sendMessage(
        conversation,
        questionnaire.conclusion || 'Thank you for completing the questionnaire',
        currentQuestion.id,
      );
      return conversation;
    }

    const updatedConversation = await this.conversationRepository.save(
      conversation.id!,
      {
        state: ConversationState.PROGRESS,
        currentQuestionId: processingResult.nextQuestion.id,
      },
    );

    await this.sendQuestion(
      updatedConversation,
      processingResult.nextQuestion
    );

    return updatedConversation;

  }

  async closeConversation(conversationId: string) {
    return this.conversationRepository.save(conversationId, {
      status: ConversationStatus.COMPLETED,
      state: ConversationState.COMPLETED,
      endedAt: new Date(),
    });
  }
}
