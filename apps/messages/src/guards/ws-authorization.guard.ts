import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WSAuthorizationGuard implements CanActivate {


    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const client = context.switchToWs().getClient()
        console.log('client.data.user', client.data.user)
        return !!client.data.user
    }
}