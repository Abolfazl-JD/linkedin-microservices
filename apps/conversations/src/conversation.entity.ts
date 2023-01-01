import { Message } from "apps/messages/src/message.entity";
import { User } from "apps/users/src/user.entity";
import { JoinTable, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany } from "typeorm";

@Entity('conversations')
export class Conversation {
    @PrimaryGeneratedColumn()
    id: number

    @UpdateDateColumn()
    lastUpdate: string

    @JoinTable()
    @ManyToMany(() => User, user => user.conversations)
    users: User[]

    @OneToMany(() => Message, message => message.conversation, { nullable: true })
    messages: Message[]
}