import { Message } from "../../messages/src/message.entity";
import { User } from "../../users/src/user.entity";
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