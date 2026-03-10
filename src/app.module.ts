import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ConversationModule } from "./modules/conversation/conversation.module";
import { ChannelsModule } from './channels/channels.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGODB_URI') ||
          'mongodb://admin:admin123@localhost:27017/conversation_engine_test?authSource=admin',
        dbName:
          configService.get<string>('MONGODB_NAME') ||
          'conversation_engine_test',
      }),
    }),
    ConversationModule,
    ChannelsModule,
  ],
})
export class AppModule {}
