// src/auth/services/token.service.ts

import { createHash, randomBytes } from 'node:crypto';

import { User_Role } from '@crm/database';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import {
  ACCESS_TOKEN_AUDIENCE,
  ACCESS_TOKEN_ISSUER,
} from '../constants/auth.constants';

import type {
  T_Access_Token_Payload,
  T_Refresh_Token_Data,
} from 'types/auth/token.types';

function is_access_token_payload(
  value: unknown,
): value is T_Access_Token_Payload {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.sub === 'string' &&
    typeof payload.organization_id === 'string' &&
    typeof payload.session_id === 'string' &&
    Object.values(User_Role).some((role) => role === payload.role)
  );
}

@Injectable()
export class Token_Service {
  constructor(private readonly jwt_service: JwtService) {}

  create_access_token(payload: T_Access_Token_Payload): Promise<string> {
    return this.jwt_service.signAsync(payload);
  }

  create_refresh_token(): T_Refresh_Token_Data {
    const refresh_token = randomBytes(32).toString('base64url');

    const refresh_token_hash = this.hash_refresh_token(refresh_token);

    return {
      refresh_token,
      refresh_token_hash,
    };
  }

  hash_refresh_token(refresh_token: string): string {
    return createHash('sha256').update(refresh_token).digest('hex');
  }

  async verify_access_token(
    access_token: string,
  ): Promise<T_Access_Token_Payload> {
    const payload: unknown = await this.jwt_service.verifyAsync(access_token, {
      algorithms: ['HS256'],
      issuer: ACCESS_TOKEN_ISSUER,
      audience: ACCESS_TOKEN_AUDIENCE,
    });

    if (!is_access_token_payload(payload)) {
      throw new Error('Invalid access token payload');
    }

    return payload;
  }
}
