import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { MessagesService } from '../messages.service';

@Injectable()
export class ConversationMemberGuard implements CanActivate {

    constructor(private readonly messagesService: MessagesService){}

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const client = context.switchToWs().getClient()
        console.log('client', client)
        const data = context.switchToWs().getData()
        console.log('data', data)
        console.log(data.conversationId, client.data.user)
        const userIsMemberOfConversation = await this.messagesService.checkUserConversation(data.conversationId, client.data.user)
        console.log(userIsMemberOfConversation)
        if(!userIsMemberOfConversation) throw new WsException(`user with id ${client.data.user.id} is not a member of this conversation`)
        return true
    }
}