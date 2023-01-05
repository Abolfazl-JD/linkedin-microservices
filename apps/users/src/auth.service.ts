import { BadRequestException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { compare, genSalt, hash } from "bcrypt";
import { sign, verify } from "jsonwebtoken";
import { LoginUserDto } from "./dtos/login-user.dto";
import { RegisterUserDto } from "./dtos/register-user.dto";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { User } from "./user.entity";
import { UsersService } from "./users.service";

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private readonly configService: ConfigService
    ) { }
    
    async signupUser(userInfo: RegisterUserDto) {
        // find user and check if this user does not exist
        const user = await this.usersService.findUserByEmail(userInfo.email)
        if (user) throw new BadRequestException('this user has already exist')
        // hash password and save user to the database
        userInfo.password = await this.usersService.hashValue(userInfo.password)
        return this.usersService.saveUser(userInfo)
    }

    async loginUser(userInfo: LoginUserDto) {
        const { email, password: enteredPassword } = userInfo
        // check if this user has already exist in database
        const user = await this.usersService.findUserByEmail(email)
        if (!user) throw new UnauthorizedException('there is no account with this gmail')
        // check password of the user
        const isPasswordCorrect = await this.usersService.compareDataWithEncrypted(enteredPassword, user.password)
        if(!isPasswordCorrect) throw new UnauthorizedException('password incorrect')
        return user
    }
  
    async updateUser(userId: number, userInfo: UpdateUserDto) {
        // find user by the given id
        const user = await this.usersService.findUserById(userId)
        if (!user) throw new UnauthorizedException('there is no account with this gmail')
        // if trying to edit password, check the old password is correct
        if (userInfo.oldPassword) {
            const isPasswordCorrect = this.usersService.compareDataWithEncrypted(userInfo.oldPassword, user.password)
            if(!isPasswordCorrect) throw new UnauthorizedException('password incorrect')
            userInfo.password = await this.usersService.hashValue(userInfo.password)
        }
        // if trying to edit email, check email is not already for another account
        if (userInfo.email) {
            const foundUser = await this.usersService.findUserByEmail(userInfo.email)
            if(foundUser) throw new BadRequestException('the email you have entered is already in use')
        }
        // edit user
        return await this.usersService.saveUser({ ...user, ...userInfo })
    }

    generateJWT(body: Partial<User>) {
        return sign(
            body,
            this.configService.get<string>('JWT_SECRET'),
            { expiresIn: this.configService.get<string>('JWT_LIFETIME') }
        )
    }

    async verifyAccessToken(token: string) {
        try {
            console.log('\n verifying the token...')
            const decoded: any = verify(
                token,
                this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET')
            )
            console.log('\n token was successfully verified', decoded)
            const { password, ...user } = await this.usersService.findUserById(decoded.id)
            return user
        } catch (error) {
            throw new BadRequestException('unable to verify token')
        }
    }

    async generateJWTCookies(user: User) {
        const accessTokenCookie = this.getJWTAccessTokenCookie(user.id)
        console.log('\n access token cookie is', accessTokenCookie)
        const { cookie: refreshTokenCookie, token: refreshToken } = this.getCookieWithJwtRefreshToken(user.id)
        console.log('\n refresh token cookie is: ', refreshTokenCookie)
        // save refresh token to the database
        await this.usersService.saveRefreshTokenToDatabase(refreshToken, user.id)
        return { accessTokenCookie, refreshTokenCookie }
    }

    getJWTAccessTokenCookie(userId: number) {
        const token = sign(
          { id: userId },
          this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
          { expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION_TIME') }
        )
        return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}`;
    }

    getCookieWithJwtRefreshToken(userId: number) {
        const token = sign(
          { id: userId },
          this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
          { expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION_TIME') }
        )
        const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}`;
        return { cookie, token }
    }

    getCookiesForLogOut() {
        return [
          'Authentication=; HttpOnly; Path=/; Max-Age=0',
          'Refresh=; HttpOnly; Path=/; Max-Age=0'
        ];
    }

}