import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ConversationModule } from "./modules/conversation/conversation.module";
import { ChannelsModule } from './channels/channels.module';
import { MongooseCollectionPrefixPlugin } from "./modules/conversation/schemas/prefix.plugin";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI'),
        dbName: configService.get<string>('MONGODB_NAME') || 'conversation_engine_test',
        connectionFactory: (connection) => {
          const prefix = configService.get<string>('DB_PREFIX') || 'dev_';
          connection.plugin(MongooseCollectionPrefixPlugin, { prefix });
          return connection;
        },
      }),
      
    }),
    ConversationModule,
    ChannelsModule,
  ],
})
export class AppModule {}
