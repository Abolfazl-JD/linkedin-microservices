import { USERS_SERVICE } from '@app/common';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConnectionReq, StatusEnum } from './connection-req.entity';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { User } from '../../users/src/user.entity';

@Injectable()
export class ConnectionReqsService {

    constructor(
        @InjectRepository(ConnectionReq) private connectionReqsRepo: Repository<ConnectionReq>,
        @Inject(USERS_SERVICE) private readonly usersClient: ClientProxy
    ) { }

    async sendConnectionReq(sender: User, recieverId: number) {
        // find reciever user and exclude password from it
        const { password, ...reciever } = await lastValueFrom(this.usersClient.send('find-user', { id: recieverId }))
        // check if this request is not already in the database
        const connectionStatus = await this.getConnectionReqStatus(sender, reciever)
        console.log('connectionStatus',connectionStatus)
        if (connectionStatus !== 'not-sent-any-connection-request') throw new BadRequestException({
            msg: "this request has already exist",
            ConnectionRequestStatus: connectionStatus
        })
        // add connection request
        return this.addConnectionReq(sender, reciever)
    }

    findRecievedConnectionReqs(userId: number) {
        return this.connectionReqsRepo.find({
            relations: { sender: true },
            where: {
                reciever: {
                    id: userId
                }
            }
        })
    }

    async getConnectionReqStatus(sender: User, reciever: User) {
        const connectionReq = await this.connectionReqsRepo.findOne({
            relations: {
                sender: true,
                reciever: true
            },
            where: [
                { sender, reciever },
                { sender: reciever, reciever: sender }
            ]
        })

        if (!connectionReq) return 'not-sent-any-connection-request'
        else if (connectionReq.reciever.id === sender.id && connectionReq.status === StatusEnum.PENDING)
            return 'waiting-for-current-user-to-answer'
        return connectionReq.status
    }

    async updateConnectionReqStatus(id: number, updatedStatus: StatusEnum) {
        const connectionRequest = await this.findOneConnectionReqById(id)
        connectionRequest.status = updatedStatus
        return this.connectionReqsRepo.save(connectionRequest)
    }

    async findUserFriends(userId: number) {
        const acceptedConnectReqs = await this.getUserAcceptedRequests(userId)
        const friends: User[] = []

        for (const connectionRequest of acceptedConnectReqs) {
            if (connectionRequest.sender.id === userId)
                friends.push(connectionRequest.reciever)
            else friends.push(connectionRequest.sender)
        }
        return friends
    }

    getUserAcceptedRequests(id: number) {
        return this.connectionReqsRepo.find({
            relations: { reciever: true, sender: true },
            where: [
                {
                    status: StatusEnum.ACCEPTED,
                    sender: { id }
                },
                {
                    status: StatusEnum.ACCEPTED,
                    reciever: { id }
                }
            ]
        })
    }

    async findOneConnectionReqById(id: number) {
        const connectionRequest = await this.connectionReqsRepo.findOne({
            where: { id },
            relations: { sender: true, reciever: true }
        })
        if (!connectionRequest) throw new NotFoundException('connection request with this id was not found')
        return connectionRequest
    }

    addConnectionReq(sender: User, reciever: User) {
        const newConnectionReq = this.connectionReqsRepo.create()
        newConnectionReq.sender = sender
        newConnectionReq.reciever = reciever
        return this.connectionReqsRepo.save(newConnectionReq)
    }

}
