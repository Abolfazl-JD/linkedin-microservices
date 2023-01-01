import { AuthorizedReq, CONNECTION_REQUESTS_SERVICE } from '@app/common';
import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { User } from 'apps/users/src/user.entity';

@Injectable()
export class CreateConversationGuard implements CanActivate {

    constructor(@Inject(CONNECTION_REQUESTS_SERVICE) private readonly connectionReqClinet: ClientProxy){}
    
    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request: AuthorizedReq = context.switchToHttp().getRequest()
        const { friendId } = request.params
        const { id: userId } = request.user
        console.log('friend-id: ', friendId, 'user-id: ', userId)
        const userFriends: User[] = await lastValueFrom(
            this.connectionReqClinet.send('get-friends', { userId })
        )
        console.log('user-friends are: ', userFriends)
        return userFriends.map(u => u.id).includes(+friendId)
    }
}