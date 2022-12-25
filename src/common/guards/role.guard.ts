import { Role } from '../enum/role.enum';
import { UserService } from 'src/user/user.service';
import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
const RoleGuard = (role: Role): Type<CanActivate> => {
  class RoleGuardMixin implements CanActivate {
    constructor(private readonly userService: UserService) {}
    async canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest();
      if (!('user' in request)) return false;
      const user = request.user;
      if (user.role == role) return true;
    }
  }
  return mixin(RoleGuardMixin);
};
export default RoleGuard;
