import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verify } from 'jsonwebtoken';
import { UsersService } from '../users.service';

@Injectable()
export class JWTRefreshGuard implements CanActivate {

    constructor(
      private readonly usersService: UsersService,
      private readonly configService : ConfigService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest()
        console.log('\n request cookies are: ', req.cookies)
        if(!req.cookies?.Refresh) return false
        const { Refresh: refreshToken } = req.cookies

        try {
            const decoded: any = verify(refreshToken, this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'))
            console.log('\n decode data is: ',decoded)
            const user = await this.usersService.getUserIfRefreshTokenMatches(refreshToken, decoded.id)
            if(!user) return false
            req.user = user
            return true
        } catch (err) {
            return false
        }
    }
}
