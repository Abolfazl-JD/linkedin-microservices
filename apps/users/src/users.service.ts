import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, genSalt, hash } from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
    
    constructor(
        @InjectRepository(User) private usersRepository: Repository<User>,
    ) { }
    
    async saveUser(userInfo: Partial<User>) {
        const { password, ...savedUser } = await this.usersRepository.save(userInfo)
        console.log(savedUser)
        return savedUser
    }

    findUserByEmail(email: string) {
        return this.usersRepository.findOneBy({ email })
    }

    findUserById(id: number) {
        return this.usersRepository.findOneBy({ id })
    }

    async updateUserImage(id: number, imagePath: string) {
        const user = await this.findUserById(id)
        user.imagePath = imagePath
        return this.usersRepository.save(user)
    }

    async updateEmailConfirmation(email: string) {
        const user = await this.findUserByEmail(email)
        user.emailIsConfirmed = true
        return this.saveUser(user)
    }

    async updateClientId(email: string, clientId: string) {
        const user = await this.findUserByEmail(email)
        user.clientId = clientId
        return this.saveUser(user)
    }

    async saveRefreshTokenToDatabase(refreshToken: string, userId: number) {
        const hashedRefreshToken = await this.hashValue(refreshToken)
        console.log('\n saving hashed refresh token to the database :', hashedRefreshToken)
        await this.usersRepository.update(userId, { hashedRefreshToken })
    }

    async getUserIfRefreshTokenMatches(refreshToken: string, userId: number) {
        const user = await this.findUserById(userId)
        console.log('\n gotten data by id: ', user)
        const isRefreshTokenMatching = await this.compareDataWithEncrypted(
          refreshToken,
          user.hashedRefreshToken
        )
        console.log('\n refresh token matches ?', isRefreshTokenMatching)
        if (isRefreshTokenMatching) return user
        return null
    }
  
  
    async hashValue(data: string) {
        const salt = await genSalt(10)
        return hash(data, salt)
    }

    async compareDataWithEncrypted(dataToCheck: string, encryptedData: string) {
        const isMatched = await compare(dataToCheck, encryptedData)
        return isMatched
    }
  
    removeRefreshTokenFromDatabase(userId: number) {
        return this.usersRepository.update(userId, {
          hashedRefreshToken: null
        })
    }
}
