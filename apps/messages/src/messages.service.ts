import { CONVERSATION_SERVICE, USERS_SERVICE } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from '../../conversations/src/conversation.entity';
import { Role, User } from '../../users/src/user.entity';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { CreateMessageDto } from './dtos/create-message.dto';

@Injectable()
export class MessagesService {
    constructor(
        @Inject(USERS_SERVICE) private readonly usersClient: ClientProxy,
        @Inject(CONVERSATION_SERVICE) private readonly conversationsClient: ClientProxy,
        @InjectRepository(Message) private messagesRepo: Repository<Message>
    ) { }
    
    addClientIdToUser(email: string, clientId: string) {
        return lastValueFrom(this.usersClient.send('update-clientId', { email, clientId }))
    }

    async checkUserConversation(conversationId: number, user: User) {
        if (user.role === Role.ADMIN) return true
        const conversation: Conversation = await lastValueFrom(
            this.conversationsClient.send('get-conversation', { conversationId })
        )
        return conversation.users.map(u => u.id).includes(user.id)
    }

    findConversationMessages(conversationId: number) {
        return this.messagesRepo.find({
            relations: {
                conversation: true,
                user: true
            },
            where: {
                conversation: {
                    id: conversationId
                }
            },
            order: {
                createdAt: "ASC",
                id: "ASC"
            }
        })
    }

    async createNewMessage(messagesInfo: CreateMessageDto, user: User) {
        const { conversationId, text } = messagesInfo
        console.log(text)
        const conversation: Conversation = await lastValueFrom(
            this.conversationsClient.send('get-conversation', { conversationId })
        )
        console.log('conversation is: ', conversation)
        return this.messagesRepo.save({ conversation, user, text })
    }
}
