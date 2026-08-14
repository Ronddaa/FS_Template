import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import type {
  T_Authenticated_Request,
  T_Authenticated_User,
} from 'types/auth/authenticated_request.types';

export const Current_User = createParamDecorator(
  (_data: unknown, context: ExecutionContext): T_Authenticated_User => {
    const request = context
      .switchToHttp()
      .getRequest<T_Authenticated_Request>();

    if (!request.auth_user) {
      throw new UnauthorizedException('Authenticated user is missing');
    }

    return request.auth_user;
  },
);
