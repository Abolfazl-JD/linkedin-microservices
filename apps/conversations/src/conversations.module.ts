import { CONNECTION_REQUESTS_SERVICE, DatabaseModule, RmqModule, USERS_SERVICE } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './conversation.entity';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/conversations/.env'
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([ Conversation ]),
    RmqModule.register({
      name: USERS_SERVICE,
      queue: 'USERS'
    }),
    RmqModule.register({
      name: CONNECTION_REQUESTS_SERVICE,
      queue: 'CONNECTION_REQUESTS'
    })
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService],
})
export class ConversationsModule {}
