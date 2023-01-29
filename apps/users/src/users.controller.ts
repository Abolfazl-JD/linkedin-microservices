import { BadRequestException, Body, Controller, Get, HttpStatus, Inject, Param, ParseFilePipeBuilder, Patch, Post, Res, Req, UploadedFile, UseGuards, UseInterceptors, HttpCode, ClassSerializerInterceptor } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dtos/login-user.dto';
import { RegisterUserDto } from './dtos/register-user.dto';
import { UsersService } from './users.service';
import { AuthorizationGuard, AuthorizedReq, EmailConfirmationGuard, EMAIL_SERVICE } from '@app/common';
import { UpdateUserGuard } from './guards/update-user.guard';
import { UpdateUserDto } from './dtos/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import { unlinkSync } from 'fs';
import { isImageExtSafe, multerConfigOptions } from '../multer.config';
import { ClientProxy, Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { ValidateUserDto } from './dtos/validate-user.dto';
import { UpdateClientIdDto } from './dtos/update-client-id.dto';
import { Request } from 'express';
import { User } from './user.entity';
import { JWTRefreshGuard } from './guards/jwt-refresh.guard';
import { lastValueFrom } from 'rxjs';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  
    constructor(
        private readonly usersService: UsersService,
        private readonly authService: AuthService,
        @Inject(EMAIL_SERVICE) private readonly emailClient: ClientProxy
    ) { }

    @Post('register')
    async signupUser(@Body() userInfo: RegisterUserDto, @Req() req: Request) {
        const user = await this.authService.signupUser(userInfo)
        console.log('\n signed up user is : ', user)
        const { accessTokenCookie, refreshTokenCookie } = await this.authService.generateJWTCookies(user as User)
        await lastValueFrom(this.emailClient.emit('user-created', user))

        req.res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie])
        return user
    }

    @Post('login')
    async loginUser(@Body() userInfo: LoginUserDto, @Req() req: Request) {
        const user = await this.authService.loginUser(userInfo)
        console.log('\n logged in user is:', user)
        const { accessTokenCookie, refreshTokenCookie } = await this.authService.generateJWTCookies(user)

        req.res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie])
        return user
    }

    @UseGuards(JWTRefreshGuard)
    @Get('refresh')
    refresh(@Req() req: AuthorizedReq) {
        console.log('\n testing current user decorator : ', req.user)
        const accessTokenCookie = this.authService.getJWTAccessTokenCookie(req.user.id)
        console.log('\n new access token cookie is: ', accessTokenCookie)
        req.res.setHeader('Set-Cookie', accessTokenCookie)
        return req.user
    }

    @UseGuards(AuthorizationGuard)
    @Post('logout')
    @HttpCode(200)
    async logOut(@Req() req: AuthorizedReq) {
        await this.usersService.removeRefreshTokenFromDatabase(req.user.id)
        req.res.setHeader('Set-Cookie', this.authService.getCookiesForLogOut())
        return 'you have been successfully logged out'
    }

    @Get(':id')
    getSingleUser(@Param('id') id: number) {
        return this.usersService.findUserById(id)
    }

    @UseGuards(AuthorizationGuard, EmailConfirmationGuard, UpdateUserGuard)
    @Patch(':id')
    updateUser(@Param('id') id: number, @Body() userInfo: UpdateUserDto) {
        return this.authService.updateUser(id, userInfo)
    }

    @UseGuards(AuthorizationGuard, EmailConfirmationGuard)
    @Post('upload-image')
    @UseInterceptors(FileInterceptor('file', multerConfigOptions))
    async uploadFile(
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addMaxSizeValidator({ maxSize: 1000000 })
                .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })
        ) file: Express.Multer.File,
        @Req() request: AuthorizedReq
    ){
        const fullFilePath = join(process.cwd(), 'apps/users/images/', file.filename)
        // check if the file extension is safe
        const isImgExtSafe = await isImageExtSafe(fullFilePath)
          
        if (isImgExtSafe) return this.usersService.updateUserImage(request.user.id, file.filename)
        unlinkSync(fullFilePath)
        throw new BadRequestException('the file content does not match its extension')
    }

    @Get('image/:filename')
    getImage(@Param('filename') filename: string, @Res() res: any) {
        let imgPath = ''
        if (!filename || ['null', '[null]', 'undefined'].includes(filename))
            imgPath = '51ae42ad-0d0a-40ed-baba-49b7ef0adc6b.jpg'
        else imgPath = filename
        return res.sendFile(imgPath, { root: './apps/users/images' })
    }
    
    @MessagePattern('validate-user')
    handleUserValidation(@Payload() data: ValidateUserDto, @Ctx() context: RmqContext) {
        console.log('\n validate-user message was recieved')
        console.log('\n the token is:', data.token)
        console.log('\n ready to verify token...')
        return this.authService.verifyAccessToken(data.token)
    }

    @MessagePattern('confirm-email')
    async confirmEmail(@Payload() data: { email: string }) {
        console.log('\n confirm-email message recieved')
        const user = await this.usersService.findUserByEmail(data.email)
        console.log('\n user was found :', user)
        if (user.emailIsConfirmed) throw new BadRequestException('Email already confirmed')
        return this.usersService.updateEmailConfirmation(data.email)
    }

    @MessagePattern('find-user')
    handleFindingUser(@Payload() data: { id: number }) {
        return this.usersService.findUserById(data.id)
    }

    @MessagePattern('generate-JWT')
    generateToken(@Payload() data: { email: string }) {
        console.log('generate-jwt message recieved')
        return this.authService.generateJWT(data)
    }

    @MessagePattern('update-clientId')
    handleUpdatingClientId(@Payload() data: UpdateClientIdDto) {
        console.log('update-clientId recieved')
        return this.usersService.updateClientId(data.email, data.clientId)
    }
}
