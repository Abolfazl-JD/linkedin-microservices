import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from '../../users/src/user.entity';
import { Conversation } from "../../conversations/src/conversation.entity";

@Entity('messages')
export class Message {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    text: string

    @CreateDateColumn()
    createdAt: string

    @ManyToOne(() => User, user => user.messages)
    user: User

    @ManyToOne(() => Conversation, co => co.messages)
    conversation: Conversation
}