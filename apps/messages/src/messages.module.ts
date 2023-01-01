import { CONVERSATION_SERVICE, DatabaseModule, RmqModule, USERS_SERVICE } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { MessagesGateway } from './messages.gateway';
import { MessagesService } from './messages.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/messages/.env'
    }),
    RmqModule.register({
      name: USERS_SERVICE,
      queue: "USERS"
    }),
    RmqModule.register({
      name: CONVERSATION_SERVICE,
      queue: "CONVERSATIONS"
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([ Message ])
  ],
  providers: [MessagesService, MessagesGateway],
})
export class MessagesModule {}
