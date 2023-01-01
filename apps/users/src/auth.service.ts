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
        userInfo.password = await this.encryptPassword(userInfo.password)
        const newUser = await this.usersService.saveUser(userInfo)
        // create JWT and return it to the user
        const token = this.generateJWT({ id: newUser.id, email: newUser.email })
        return { token, newUser }
    }

    async loginUser(userInfo: LoginUserDto) {
        const { email, password: enteredPassword } = userInfo
        // check if this user has already exist in database
        const user = await this.usersService.findUserByEmail(email)
        if (!user) throw new UnauthorizedException('there is no account with this gmail')
        // check password of the user
        await this.checkPassword(enteredPassword, user.password)
        // create JWT and return it to the user
        const token = this.generateJWT({ id: user.id, email: user.email })
        // exclude password from user
        const { password, ...userWithNoPassword } = user
        return { token, userWithNoPassword }
    }
  
    async updateUser(userId: number, userInfo: UpdateUserDto) {
        // find user by the given id
        const user = await this.usersService.findUserById(userId)
        if (!user) throw new UnauthorizedException('there is no account with this gmail')
        // if trying to edit password, check the old password is correct
        if (userInfo.oldPassword) {
            await this.checkPassword(userInfo.oldPassword, user.password)
            userInfo.password = await this.encryptPassword(userInfo.password)
        }
        // if trying to edit email, check email is not already for another account
        if (userInfo.email) {
            const foundUser = await this.usersService.findUserByEmail(userInfo.email)
            if(foundUser) throw new BadRequestException('the email you have entered is already in use')
        }
        // edit user
        const updatedUser = await this.usersService.saveUser({ ...user, ...userInfo })
        // create JWT and return it to the user
        const token = this.generateJWT({ id: updatedUser.id, email: updatedUser.email })
        return { token, updatedUser }
    }

    async encryptPassword(password: string) {
        const salt = await genSalt(10)
        return hash(password, salt)
      }
    
    async checkPassword(passToCheck: string, encryptedPass: string) {
        const isPasswordCorrect = await compare(passToCheck, encryptedPass)
        if(!isPasswordCorrect) throw new UnauthorizedException('password incorrect')
    }

    generateJWT(body: Partial<User>) {
        return sign(
            body,
            this.configService.get<string>('JWT_SECRET'),
            { expiresIn: this.configService.get<string>('JWT_LIFETIME') }
        )
    }

    async verifyToken(token: string) {
        try {
            console.log('\n verifying the token...')
            const decoded: any = verify(
                token,
                this.configService.get<string>('JWT_SECRET')
            )
            console.log('\n token was successfully verified', decoded)
            const { password, ...user } = await this.usersService.findUserById(decoded.id)
            return user
        } catch (error) {
            throw new BadRequestException('unable to verify token')
        }
    }

}