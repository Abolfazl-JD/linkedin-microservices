import { AuthorizedReq } from '@app/common';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class UpdateUserGuard implements CanActivate {
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request: AuthorizedReq = context.switchToHttp().getRequest()
        const { id } = request.params
        const { id: userId } = request.user
        return +id === userId
    }
}