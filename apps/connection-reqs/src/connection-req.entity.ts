import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from '../../users/src/user.entity';

export enum StatusEnum {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    DECLINED = 'declined'
}

@Entity('connection_requests')
export class ConnectionReq {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'enum', enum: StatusEnum, default: StatusEnum.PENDING })
    status: StatusEnum

    @ManyToOne(() => User, user => user.sentConnectionReqs)
    sender: User

    @ManyToOne(() => User, user => user.recievedConnectionReqs)
    reciever: User
}