import { AuthorizedReq } from '@app/common';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Role } from 'apps/users/src/user.entity';
import { Observable } from 'rxjs';
import { FeedsService } from '../feeds.service';

@Injectable()
export class UpdateFeedGuard implements CanActivate {

    constructor(private readonly feedsService: FeedsService){}

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request: AuthorizedReq = context.switchToHttp().getRequest()
        const { id } = request.params
        const { id: userId, role } = request.user
        if(role === Role.ADMIN) return true
        const feed = await this.feedsService.findOneFeed(+id)
        return feed.author.id === userId
    }
}