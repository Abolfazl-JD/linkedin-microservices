import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
 
@Injectable()
export class EmailConfirmationGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ) {
    const request: any = context.switchToHttp().getRequest();
 
    if (!request.user?.emailIsConfirmed) {
      throw new UnauthorizedException('Confirm your email first');
    }
 
    return true;
  }
}