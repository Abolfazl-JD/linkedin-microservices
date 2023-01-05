import { Feed } from "apps/feeds/src/feed.entity";
import { Exclude } from "class-transformer";
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ConnectionReq } from "apps/connection-reqs/src/connection-req.entity"
import { Conversation } from "apps/conversations/src/conversation.entity";
import { Message } from "apps/messages/src/message.entity";

export enum Role {
    ADMIN = "admin",
    USER = 'user',
    PREMIUM = 'premium'
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: true })
    firstName: string

    @Column()
    lastName: string

    @Column()
    email: string

    @Column({ default: false })
    emailIsConfirmed: boolean

    @Exclude()
    @Column()
    password: string

    @Exclude()
    @Column({ nullable: true, default: null })
    hashedRefreshToken: string

    @Column({ type: 'enum', enum: Role, default: Role.USER })
    role: string

    @Column({ nullable: true })
    imagePath: string

    @Column({ nullable: true })
    clientId: string

    @OneToMany(() => Feed, feed => feed.author)
    feeds: Feed[]

    @OneToMany(() => ConnectionReq, CR => CR.sender)
    sentConnectionReqs: ConnectionReq[]

    @OneToMany(() => ConnectionReq, CR => CR.reciever)
    recievedConnectionReqs: ConnectionReq[]
    
    @ManyToMany(() => Conversation, co => co.users)
    conversations: Conversation[]

    @OneToMany(() => Message, message => message.user)
    messages: Message[]
}