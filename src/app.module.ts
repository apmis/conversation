import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ConversationModule } from "./modules/conversation/conversation.module";
import { ChannelsModule } from './channels/channels.module';
import { QuestionnaireModule } from './modules/questionnaire/questionnaire.module';
import { WorkflowEngineModule } from './modules/workflow/workflow-engine.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI'),
        dbName: configService.get<string>('MONGODB_NAME') || 'conversation_engine_test',

        connectionFactory: (connection) => {
          const dbPrefix = configService.get<string>('DB_PREFIX') || 'dev';
          const prefix = `conversation_${dbPrefix}_`;

          const originalModel = connection.model.bind(connection);

          connection.model = function (name: string, schema?: any, collection?: string) {
            const prefixedCollection = `${prefix}${collection || name.toLowerCase() + 's'}`;
            return originalModel(name, schema, prefixedCollection);
          } as any;

          return connection;
        },
      }),
    }),

    QuestionnaireModule,
    ConversationModule,
    ChannelsModule,
    WorkflowEngineModule,
  ],
})
export class AppModule {}
