import { User } from "../../users/src/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('feeds')
export class Feed {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    body: string

    @CreateDateColumn()
    createdAt: string

    @ManyToOne(() => User, user => user.feeds)
    author: User
}