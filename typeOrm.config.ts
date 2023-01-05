import { DataSource } from "typeorm"
import { config } from 'dotenv';
import { ConfigService } from "@nestjs/config";
import { ConnectionReq } from "./apps/connection-reqs/src/connection-req.entity";
import { Conversation } from "./apps/conversations/src/conversation.entity";
import { Feed } from "./apps/feeds/src/feed.entity";
import { Message } from "./apps/messages/src/message.entity";
import { User } from "./apps/users/src/user.entity";

config();

const configService = new ConfigService();


export default new DataSource({
    type: 'postgres',
    host: configService.get('POSTGRES_HOST'),
    port: configService.get('POSTGRES_PORT'),
    username: configService.get('POSTGRES_USERNAME'),
    password: configService.get('POSTGRES_PASSWORD'),
    database: configService.get('POSTGRES_DATABASE'),
    synchronize: false,
    entities: [User, Feed, ConnectionReq, Conversation, Message],
})