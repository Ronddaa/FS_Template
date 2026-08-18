//src/auth/guards/allowed_roles.guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Allowed_Roles } from '../decorators/allowed_roles.decorator';
import { T_Authenticated_Request } from 'types/auth/authenticated_request.types';

@Injectable()
export class Allowed_Roles_Guard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowed_roles = this.reflector.getAllAndOverride(Allowed_Roles, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!allowed_roles) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<T_Authenticated_Request>();

    const auth_user = request.auth_user;

    if (!auth_user) {
      throw new UnauthorizedException();
    }

    return allowed_roles.includes(auth_user.role);
  }
}
