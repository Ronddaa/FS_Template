//src/auth/services/session.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Database_Service } from 'src/database/database.service';
import { Token_Service } from './token.service';
import {
  T_Create_Session_Input,
  T_Created_Session,
  T_Refresh_Session_Input,
} from 'types/auth/session.types';
import { REFRESH_SESSION_DURATION_MS } from '../constants/auth.constants';

@Injectable()
export class Session_Service {
  constructor(
    private readonly db_service: Database_Service,
    private readonly token_service: Token_Service,
  ) {}

  async create_session(
    input: T_Create_Session_Input,
  ): Promise<T_Created_Session> {
    const { refresh_token, refresh_token_hash } =
      this.token_service.create_refresh_token();

    const now = new Date();

    const refresh_token_expires_at = new Date(
      now.getTime() + REFRESH_SESSION_DURATION_MS,
    );

    const session = await this.db_service.user_Session.create({
      data: {
        user_id: input.user_id,
        refresh_token_hash,
        user_agent: input.user_agent,
        ip_address: input.ip_address,
        last_used_at: now,
        expires_at: refresh_token_expires_at,
      },
      select: {
        id: true,
      },
    });

    try {
      const access_token = await this.token_service.create_access_token({
        sub: input.user_id,
        organization_id: input.organization_id,
        session_id: session.id,
        role: input.role,
      });

      return {
        access_token,
        refresh_token,
        refresh_token_expires_at,
      };
    } catch (error: unknown) {
      await this.db_service.user_Session
        .delete({
          where: {
            id: session.id,
          },
        })
        .catch(() => undefined);

      throw error;
    }
  }

  async refresh_session(
    input: T_Refresh_Session_Input,
  ): Promise<T_Created_Session> {
    const current_refresh_token_hash = this.token_service.hash_refresh_token(
      input.refresh_token,
    );

    const session = await this.db_service.user_Session.findUnique({
      where: {
        refresh_token_hash: current_refresh_token_hash,
      },
      select: {
        id: true,
        expires_at: true,
        revoked_at: true,

        user: {
          select: {
            id: true,
            organization_id: true,
            role: true,
            status: true,
          },
        },
      },
    });

    const now = new Date();

    if (!session || session.revoked_at !== null || session.expires_at <= now) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    if (session.user.status !== 'ACTIVE') {
      await this.db_service.user_Session.update({
        where: {
          id: session.id,
        },
        data: {
          revoked_at: now,
          revoked_reason: 'USER_NOT_ACTIVE',
        },
      });

      throw new UnauthorizedException('Invalid or expired sessoin');
    }

    const {
      refresh_token: next_refresh_token,
      refresh_token_hash: next_refresh_token_hash,
    } = this.token_service.create_refresh_token();

    const access_token = await this.token_service.create_access_token({
      sub: session.user.id,
      organization_id: session.user.organization_id,
      session_id: session.id,
      role: session.user.role,
    });

    const update_result = await this.db_service.user_Session.updateMany({
      where: {
        id: session.id,
        refresh_token_hash: current_refresh_token_hash,
        revoked_at: null,
        expires_at: {
          gt: now,
        },
      },
      data: {
        refresh_token_hash: next_refresh_token_hash,
        last_used_at: now,
        user_agent: input.user_agent,
        ip_address: input.ip_address,
      },
    });

    if (update_result.count !== 1) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    return {
      access_token,
      refresh_token: next_refresh_token,
      refresh_token_expires_at: session.expires_at,
    };
  }

  async revoke_session(
    refresh_token: string,
    revoked_reason: string,
  ): Promise<void> {
    const refresh_token_hash =
      this.token_service.hash_refresh_token(refresh_token);

    await this.db_service.user_Session.updateMany({
      where: {
        refresh_token_hash,
        revoked_at: null,
      },
      data: {
        revoked_at: new Date(),
        revoked_reason,
      },
    });
  }
}
