//src/auth/guards/access_token.guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Token_Service } from '../services/token.service';
import { Database_Service } from 'src/database/database.service';
import { PUBLIC_ROUTE_KEY } from '../decorators/public_route.decorator';
import { T_Authenticated_Request } from 'types/auth/authenticated_request.types';

@Injectable()
export class Access_Token_Guard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly token_service: Token_Service,
    private readonly db_service: Database_Service,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const is_public = this.reflector.getAllAndOverride<boolean>(
      PUBLIC_ROUTE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (is_public) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<T_Authenticated_Request>();

    const access_token = this.extract_access_token(request);

    try {
      const payload =
        await this.token_service.verify_access_token(access_token);

      const session = await this.db_service.user_Session.findUnique({
        where: {
          id: payload.session_id,
        },
        select: {
          expires_at: true,
          revoked_at: true,

          user: {
            select: {
              id: true,
              organization_id: true,
              email: true,
              f_name: true,
              l_name: true,
              role: true,
              status: true,
            },
          },
        },
      });

      const now = new Date();

      if (
        !session ||
        session.revoked_at !== null ||
        session.expires_at <= now ||
        session.user.id !== payload.sub ||
        session.user.organization_id !== payload.organization_id ||
        session.user.status !== 'ACTIVE'
      ) {
        throw new UnauthorizedException();
      }

      request.auth_user = {
        id: session.user.id,
        organization_id: session.user.organization_id,
        email: session.user.email,
        f_name: session.user.f_name,
        l_name: session.user.l_name,
        role: session.user.role,
        status: session.user.status,
        session_id: payload.session_id,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  private extract_access_token(request: T_Authenticated_Request): string {
    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('Access token is missing');
    }

    const [scheme, access_token, extra] = authorization.split(' ');

    if (scheme !== 'Bearer' || !access_token || extra !== undefined) {
      throw new UnauthorizedException('Invalid authorization header');
    }

    return access_token;
  }
}
