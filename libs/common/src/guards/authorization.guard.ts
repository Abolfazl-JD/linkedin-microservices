import { Injectable, CanActivate, ExecutionContext, Inject, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, Observable, tap } from 'rxjs';
import { USERS_SERVICE } from '../constants/services';

@Injectable()
export class AuthorizationGuard implements CanActivate {

  constructor(@Inject(USERS_SERVICE) private readonly usersClient: ClientProxy){}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>{
      const req = context.switchToHttp().getRequest()
      console.log('req cookies : ', req.cookies)
      if(!req.cookies?.Authentication) return false
        console.log('\n request cookies are: ', req.cookies)
        const { Authentication: accessToken } = req.cookies
        console.log('\n token is exported from authentication', accessToken)
        return this.usersClient.send('validate-user', {
            token: accessToken
        }).pipe(
            tap((res) => {
                console.log('\n auth client response is: ', res)
                console.log('\n adding user to the request')
                // exclude password from user
                const { password, ...user } = res
                req.user = user
                console.log('user was added')
            }),
            catchError(() => {
                throw new UnauthorizedException()
            }),
        )
    }
}