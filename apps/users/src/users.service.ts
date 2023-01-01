import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
}
