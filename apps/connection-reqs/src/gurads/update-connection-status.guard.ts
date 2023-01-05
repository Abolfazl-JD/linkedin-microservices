import { AuthorizedReq } from '@app/common';
import { Injectable, CanActivate, ExecutionContext, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Role } from '../../../users/src/user.entity';
import { Observable } from 'rxjs';
import { StatusEnum } from '../connection-req.entity';
import { ConnectionReqsService } from './../connection-reqs.service';

@Injectable()
export class updateConnectionStatusGuard implements CanActivate {

    constructor(private readonly connectionReqsService: ConnectionReqsService){}
    
    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request: AuthorizedReq = context.switchToHttp().getRequest()

        const { id: userId, role } = request.user
        if (role === Role.ADMIN) return true

        const { connectionReqId } = request.params
        const connectionRequest = await this.connectionReqsService.findOneConnectionReqById(+connectionReqId)

        if(connectionRequest.status !== StatusEnum.PENDING) throw new ForbiddenException('this request once was updated')
        return connectionRequest.sender.id !== userId && connectionRequest.reciever.id === userId
    }
}