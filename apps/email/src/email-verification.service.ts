import { USERS_SERVICE } from "@app/common";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ClientProxy } from "@nestjs/microservices";
import { User } from "apps/users/src/user.entity";
import { sign, verify } from "jsonwebtoken";
import { catchError, tap, lastValueFrom, firstValueFrom } from "rxjs";
import { EmailService } from "./email.service";

@Injectable()
export class EmailVerificationService {

    constructor(
        private emailService: EmailService,
        private configService: ConfigService,
        @Inject(USERS_SERVICE) private readonly usersClient: ClientProxy
    ) { }

    async sendVerificationLink(email: string) {
        const token = await lastValueFrom(this.usersClient.send('generate-JWT', { email }).pipe(
            tap((res) => res),
            catchError((err) => { throw new err })
        ))
        console.log('token', token)
        const url = `${this.configService.get<string>('EMAIL_CONFIRMATION_URL')}?token=${token}`
        console.log('url', url)
        const text = `Welcome to the linkedin clone. To confirm the email address, click here: ${url}`
        console.log('text', text)

        return this.emailService.sendMail({
            to: email,
            subject: 'Email confirmation',
            text,
        })
    }

    async decodeConfirmationToken(confirmationToken: string) {
        try {
            const decoded: any = verify(confirmationToken, process.env.JWT_SECRET)
            console.log('decoded', decoded)
            if (typeof decoded === 'object' && 'email' in decoded) return decoded.email
            throw new BadRequestException()
        } catch (err) {
            if (err?.name === 'TokenExpiredError') {
                throw new BadRequestException('Email confirmation token expired');
              }
              throw new BadRequestException('Bad confirmation token');
        }
    }

    async resendVerificationLink(user: User) {
        console.log('user', user)
        if (user.emailIsConfirmed) throw new BadRequestException('Email already confirmed')
        const { email } = user
        await this.sendVerificationLink(email)
    }

    generateJWT(body: Partial<User>) {
        return sign(
            body,
            this.configService.get<string>('JWT_SECRET'),
            { expiresIn: this.configService.get<string>('JWT_LIFETIME') }
        )
    }
}