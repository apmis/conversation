import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ConversationModule } from "./modules/conversation/conversation.module";
import { ChannelsModule } from './channels/channels.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017/conversation_engine_test?authSource=admin',
      {
        dbName: process.env.MONGODB_DB || 'conversation_engine_test',
      }
    ),
    ConversationModule,
    ChannelsModule,
  ],
})
export class AppModule {}