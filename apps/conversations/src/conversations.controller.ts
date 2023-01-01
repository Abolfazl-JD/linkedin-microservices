import { AuthorizationGuard, AuthorizedReq, EmailConfirmationGuard } from '@app/common';
import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ConversationsService } from './conversations.service';
import { CreateConversationGuard } from './guards/create-conversation.guard';

@Controller('conversations')
export class ConversationsController {

    constructor(private readonly conversationsService: ConversationsService) {}
    
    @UseGuards(AuthorizationGuard, EmailConfirmationGuard, CreateConversationGuard)
    @Post('new/:friendId')
    createConversation(@Req() req: AuthorizedReq, @Param('friendId') friendId: number) {
        return this.conversationsService.createConversation(req.user, friendId)
    }

    @UseGuards(AuthorizationGuard, EmailConfirmationGuard)
    @Get()
    findConversations(@Req() req: AuthorizedReq) {
        return this.conversationsService.getAllConversationsWithRelations(req.user.id)
    }

    @UseGuards(AuthorizationGuard, EmailConfirmationGuard)
    @Get('friend/:friendId')
    findConversationByFriendId(@Req() req: AuthorizedReq, @Param('friendId') friendId: number) {
        return this.conversationsService.findConversationByUserIds(req.user.id, friendId)
    }

    @UseGuards(AuthorizationGuard, EmailConfirmationGuard)
    @Get(':id')
    findConversationById(@Param('id') id: number) {
        console.log('hello')
        return this.conversationsService.getConversationById(id)
    }

    @MessagePattern('get-conversation')
    handleGettingConversation(@Payload() data: { conversationId: number }) {
        console.log('get-conversation message recieved')
        return this.conversationsService.getConversationById(data.conversationId)
    }
}
