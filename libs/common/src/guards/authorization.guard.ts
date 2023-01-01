import { Injectable, CanActivate, ExecutionContext, Inject, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, Observable, tap } from 'rxjs';
import { USERS_SERVICE } from '../constants/services';

@Injectable()
export class AuthorizationGuard implements CanActivate {

  constructor(@Inject(USERS_SERVICE) private readonly usersClient: ClientProxy){}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>{
    console.log('\n checking authorization started...')
    const { authorization } = context.switchToHttp().getRequest().headers
    console.log('\n authorization is :', authorization)
    if (!authorization || !authorization.startsWith('Bearer ')) return false

    const token = authorization.split(' ')[1]
    console.log('\n token is exported from authorization', token)
    console.log('\n ready to send the validate-user message to auth service')
    return this.usersClient.send('validate-user', {
            token
        }).pipe(
            tap((res) => {
                console.log('\n auth client response is: ', res)
                console.log('\n adding user to the request')
                // exclude password from user
                const { password, ...user } = res
                context.switchToHttp().getRequest().user = user
                console.log('user was added')
            }),
            catchError(() => {
                throw new UnauthorizedException()
            }),
        )
    }
}