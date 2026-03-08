import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Question, QuestionSchema } from './schemas/question.schema';
import { Option, OptionSchema } from './schemas/option.schema';
import { OptionList, OptionListSchema } from './schemas/option-list.schema';
import { ConversationService } from './services/conversation.service';
import { QuestionRepository } from './repositories/question.repository';
import { QuestionService } from './services/question.service';
import { OptionListService } from './services/option-list.service';
import { QuestionnaireService } from './services/questionnaire.service';
import { TagService } from './services/tag.service';
import { QuestionController } from './controllers/question.controller';
import { OptionListController } from './controllers/option-list.controller';
import { QuestionnaireController } from './controllers/questionnaire.controller';
import { TagController } from './controllers/tag.controller';
import { Channel, ChannelSchema } from './schemas/channel.schema';
import { Conversation, ConversationSchema } from './schemas/conversation.schema';
import { Questionnaire, QuestionnaireSchema } from './schemas/questionnaire.schema';
import { Response, ResponseSchema } from './schemas/response.schema';
import { Tag, TagSchema } from './schemas/tag.schema';
import { CreateQuestionUseCase } from './services/use-cases/create-question.use-case';
import { UpdateQuestionUseCase } from './services/use-cases/update-question.use-case';
import { QuestionMongoRepository } from './repositories/mongo/question.mongorepo';
import { ConversationRepository } from './repositories/mongo/conversation.repository';
import { ParticipantRepository } from './repositories/mongo/participant.repository';
import { ParticipantService } from './services/participant.service';
import { ResponseService } from './services/ResponseService';
import { ChannelService } from '../../channels/services/channel.service';
import { Participant, ParticipantSchema } from './schemas/participant.schema';
import { ChannelSenderFactory } from '../../channels/senders/channel-sender-factory';
import { NigeriaBulkSmsSender } from '../../channels/senders/sms-sender';
import { WhatsappSender } from '../../channels/senders/whatsapp-sender';
import { QuestionProcessorService } from './services/question-processor.service';
import { AIProcessorService } from './services/ai-processor.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
      { name: Option.name, schema: OptionSchema },
      { name: OptionList.name, schema: OptionListSchema },
      { name: Channel.name, schema: ChannelSchema },
      { name: Conversation.name, schema: ConversationSchema },
      { name: Questionnaire.name, schema: QuestionnaireSchema },
      { name: Response.name, schema: ResponseSchema },
      { name: Tag.name, schema: TagSchema },
      { name: Participant.name, schema: ParticipantSchema },
    ]),
  ],
  controllers: [
    QuestionController,
    OptionListController,
    QuestionnaireController,
    TagController,
  ],
  providers: [
    ConversationService,
    ConversationRepository,
    QuestionService,
    OptionListService,
    QuestionnaireService,
    TagService,
    ResponseService,
    ParticipantService,
    ParticipantRepository,
    ChannelService,
    ChannelSenderFactory,
    QuestionProcessorService,
    AIProcessorService,
    NigeriaBulkSmsSender,
    WhatsappSender,
    CreateQuestionUseCase,
    UpdateQuestionUseCase,
    QuestionMongoRepository,
    {
      provide: QuestionRepository,
      useClass: QuestionMongoRepository,
    },
  ],
  exports: [ConversationService, QuestionService, OptionListService, QuestionnaireService, TagService],
})
export class ConversationModule {}
