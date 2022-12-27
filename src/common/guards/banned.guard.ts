import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class BannedGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    if (!('user' in request)) return true;
    const user = request.user;
    if (user.banned == true) return false;
    return true;
  }
}
