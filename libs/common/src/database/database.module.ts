import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConnectionReq } from "apps/connection-reqs/src/connection-req.entity";
import { Conversation } from "apps/conversations/src/conversation.entity";
import { Feed } from "apps/feeds/src/feed.entity";
import { Message } from "apps/messages/src/message.entity";
import { User } from "apps/users/src/user.entity";

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
              type: 'postgres',
              host: configService.get<string>('POSTGRES_HOST'),
              port: configService.get<number>('POSTGRES_PORT'),
              username: configService.get<string>('POSTGRES_USERNAME'),
              password: configService.get<string>('POSTGRES_PASSWORD'),
              database: configService.get<string>('POSTGRES_DATABASE'),
              entities: [User, Feed, ConnectionReq, Conversation, Message],
              synchronize: false
            }),
            inject: [ConfigService]
          }),
    ]
})
export class DatabaseModule {}