import { USERS_SERVICE } from '@app/common';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../users/src/user.entity';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { Conversation } from './conversation.entity';

@Injectable()
export class ConversationsService {
    constructor(
        @InjectRepository(Conversation) private conversationsRepo: Repository<Conversation>,
        @Inject(USERS_SERVICE) private readonly usersClient: ClientProxy
    ) { }
    
    async createConversation(currentUser: User, friendId: number) {
        // get friend info by friend id
        const friend = await this.findUser(friendId)
        console.log('friend is : ', friend)
        // check if this conversation hasn't already exist
        const conversationAlreadyExist = await this.findConversationByUserIds(currentUser.id, friend.id)
        if (conversationAlreadyExist) throw new BadRequestException('this conversation already exist')
        // after checking completed , add new conversation to the database
        return this.addConversation(currentUser, friend as User)
    }

    async getAllConversationsWithRelations(userId: number) {
        const conversationsWithNoRelations = await this.findConversationsOfOneUser(userId)
        console.log('conversationsWithOneUser', conversationsWithNoRelations)

        const conversationsWithRelations: Conversation[] = []
        for (const conversation of conversationsWithNoRelations) {
            const detailedConversation = await this.getConversationById(conversation.id)
            conversationsWithRelations.push(detailedConversation)
        }
        return conversationsWithRelations
    }

    async findUser(userId: number) {
        const { password, ...friend }: User = await lastValueFrom(
            this.usersClient.send('find-user', { id: userId })
        
        )
        if (!friend) throw new NotFoundException(`friend with id of ${userId} was not found`)
        return friend
    }

    findConversationByUserIds(userId: number, friendId: number) {
        return this.conversationsRepo.createQueryBuilder('conversation')
            .leftJoin("conversation.users", "user")
            .where("user.id = :userId", { userId })
            .orWhere("user.id = :friendId", { friendId })
            .groupBy("conversation.id")
            .having("COUNT(*) > 1")
            .getOne()
    }

    addConversation(currentUser: User, friend: User) {
        const newConversation = this.conversationsRepo.create()
        newConversation.users = [currentUser, friend]
        return this.conversationsRepo.save(newConversation)
    }

    findConversationsOfOneUser(userId: number) {
        return this.conversationsRepo.createQueryBuilder("conversation")
            .innerJoin("conversation.users", "user")
            .where("user.id = :userId", { userId })
            .orderBy("conversation.lastUpdate", "DESC")
            .getMany()
    }

    async getConversationById(id: number) {
        const conversation = await this.conversationsRepo.findOne({
            where: { id },
            relations: {
                users: true,
                messages: true 
            }
        })
        if (!conversation) throw new NotFoundException(`conversation with id of ${id} was not found`)
        return conversation
    }
}
