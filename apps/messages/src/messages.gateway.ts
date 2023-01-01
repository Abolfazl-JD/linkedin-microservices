import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { MessagesService } from "./messages.service";
import { Server, Socket } from "socket.io"
import { UseGuards } from '@nestjs/common';
import { ConversationMemberGuard } from "./guards/conversation-member.guard";
import { WSAuthorizationGuard } from './guards/ws-authorization.guard';
import { CreateMessageDto } from "./dtos/create-message.dto";

@WebSocketGateway({
    cors: {
        origin: '*'
    }
})
export class MessagesGateway {

    constructor(private readonly messagesService: MessagesService) { }
    
    @WebSocketServer()
    server: Server

    @SubscribeMessage("join")
    async join(@MessageBody("email") email: string, @ConnectedSocket() client: Socket) {
        const user = await this.messagesService.addClientIdToUser(email, client.id)
        client.data.user = user
        console.log(user)
        return user
    }

    @UseGuards(WSAuthorizationGuard, ConversationMemberGuard)
    @SubscribeMessage('send-message')
    async sendMessage(@MessageBody() messageInfo: CreateMessageDto, @ConnectedSocket() client: Socket) {
        const message = await this.messagesService.createNewMessage(messageInfo, client.data.user)
        console.log('message is', message)
        this.server.emit('new-message', message)
    }

    @UseGuards(WSAuthorizationGuard, ConversationMemberGuard)
    @SubscribeMessage('get-conversation-messages')
    async getConversationMessages(@MessageBody("conversationId") conversationId: number) {
        console.log('checking completed')
        const messages = await this.messagesService.findConversationMessages(conversationId)
        console.log(messages)
        return messages
    }
}