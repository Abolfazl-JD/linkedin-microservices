import { User } from 'apps/users/src/user.entity'
import { Request } from 'express'

export interface AuthorizedReq extends Request{
    user: User
}