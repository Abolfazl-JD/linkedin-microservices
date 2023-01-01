import { Body, Controller, Get, Inject, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthorizationGuard, AuthorizedReq, RmqService, USERS_SERVICE } from '@app/common';
import { EmailConfirmationDto } from './dto/email-confirmation.dto';
import { EmailVerificationService } from './email-verification.service';
import { Ctx, EventPattern, Payload, RmqContext, ClientProxy } from '@nestjs/microservices';
import { User } from 'apps/users/src/user.entity';
import { catchError, tap } from 'rxjs';

@Controller('email')
export class EmailController {
    constructor(
        private readonly emailVerificationService: EmailVerificationService,
        private readonly rmqService: RmqService,
        @Inject(USERS_SERVICE) private readonly usersClient: ClientProxy
    ) { }

    @Get('confirm-email-token')
    confirmEmail(@Query('token') token: string) {
        return token
    }

    @EventPattern('user-created')
    sendVerificationLink(@Payload() data: User, @Ctx() context: RmqContext) {
        this.emailVerificationService.sendVerificationLink(data.email)
        this.rmqService.ack(context)
    }

    @Post('verify')
    async confirm(@Body() emailConfirmationDto: EmailConfirmationDto) {
        const email = await this.emailVerificationService.decodeConfirmationToken(emailConfirmationDto.token);
        console.log('\n token decoded email', email)
        return this.usersClient.send('confirm-email', { email }).pipe(
            tap((res) => res),
            catchError((err) => { throw new err }),
        )
    }

    @UseGuards(AuthorizationGuard)
    @Post('resend-verification-link')
    resendConfirmationLink(@Req() req: AuthorizedReq) {
        console.log('\n authorization check was completed')
        return this.emailVerificationService.resendVerificationLink(req.user)
    }
}
