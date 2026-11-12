// Path: apps/crm-api/src/auth/services/owner_passkey_login.service.ts

import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Database_Service } from 'src/database/database.service';
import { Session_Service } from './session.service';
import { ConfigService } from '@nestjs/config';
import {
  type AuthenticationResponseJSON,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { LOGIN_CHALLENGE_TTL_MS } from '../constants/auth.constants';
import { T_Login_Context } from 'types/auth/login.types';

@Injectable()
export class Owner_Passkey_Login_Service {
  private readonly expected_origin: string;
  private readonly rp_id: string;

  constructor(
    private readonly db_service: Database_Service,
    private readonly session_service: Session_Service,
    config_service: ConfigService,
  ) {
    const origin = new URL(config_service.getOrThrow<string>('CRM_WEB_ORIGIN'));
    this.expected_origin = origin.origin;
    this.rp_id = origin.hostname;
  }

  private check_origin(origin: string | undefined): void {
    if (origin !== this.expected_origin) {
      throw new ForbiddenException('Invalid sign-in origin.');
    }
  }

  private invalid_login() {
    return new UnauthorizedException(
      'Passkey sign-in failed. Please try again',
    );
  }

  async begin_login(origin: string | undefined) {
    this.check_origin(origin);

    const options = await generateAuthenticationOptions({
      rpID: this.rp_id,
      userVerification: 'required',
    });

    const now = new Date();

    const [, attempt] = await this.db_service.$transaction([
      this.db_service.passkey_Login_Challenge.deleteMany({
        where: {
          expires_at: { lte: now },
        },
      }),
      this.db_service.passkey_Login_Challenge.create({
        data: {
          challenge: options.challenge,
          expires_at: new Date(now.getTime() + LOGIN_CHALLENGE_TTL_MS),
        },
        select: {
          id: true,
        },
      }),
    ]);
    return { challenge_id: attempt.id, options };
  }

  async finish_login(
    origin: string | undefined,
    challenge_id: string,
    response: AuthenticationResponseJSON,
    context: T_Login_Context,
  ) {
    this.check_origin(origin);

    if (
      typeof response.id !== 'string' ||
      typeof response.response?.userHandle !== 'string'
    ) {
      throw this.invalid_login();
    }

    const [attempt, passkey] = await Promise.all([
      this.db_service.passkey_Login_Challenge.findUnique({
        where: {
          id: challenge_id,
        },
        select: {
          challenge: true,
          expires_at: true,
        },
      }),
      this.db_service.user_Passkey.findUnique({
        where: {
          credential_id: response.id,
        },
        select: {
          user_id: true,
          credential_id: true,
          public_key: true,
          counter: true,
        },
      }),
    ]);

    if (!attempt || !passkey || attempt.expires_at <= new Date()) {
      throw this.invalid_login();
    }

    const expected_handle = Buffer.from(passkey.user_id, 'utf8').toString(
      'base64url',
    );
    if (response.response.userHandle !== expected_handle) {
      throw this.invalid_login();
    }

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: attempt.challenge,
      expectedOrigin: this.expected_origin,
      expectedRPID: this.rp_id,
      requireUserVerification: true,
      credential: {
        id: passkey.credential_id,
        publicKey: new Uint8Array(passkey.public_key),
        counter: Number(passkey.counter),
      },
    }).catch(() => {
      throw this.invalid_login();
    });

    if (!verification.verified) throw this.invalid_login();

    const { newCounter, credentialBackedUp } = verification.authenticationInfo;

    return this.db_service.$transaction(async (tx) => {
      const consumed = await tx.passkey_Login_Challenge.deleteMany({
        where: {
          id: challenge_id,
          expires_at: { gt: new Date() },
        },
      });

      if (consumed.count !== 1) throw this.invalid_login();

      // Hold the owner's role and status stable until the session is saved.
      const owners = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM users
        WHERE id = ${passkey.user_id}::uuid
          AND role = 'OWNER'
          AND status = 'ACTIVE'
          AND email_verified_at IS NOT NULL
        FOR SHARE
      `;

      if (owners.length !== 1) throw this.invalid_login();

      const saved = await tx.user_Passkey.updateMany({
        where: {
          credential_id: passkey.credential_id,
          user_id: passkey.user_id,
          counter: passkey.counter,
        },
        data: {
          counter: BigInt(newCounter),
          backed_up: credentialBackedUp,
        },
      });

      if (saved.count !== 1) throw this.invalid_login();

      const user = await tx.user.findUniqueOrThrow({
        where: { id: passkey.user_id },
        select: {
          id: true,
          organization_id: true,
          email: true,
          f_name: true,
          l_name: true,
          role: true,
          status: true,
        },
      });

      const session = await this.session_service.create_session(
        {
          user_id: user.id,
          organization_id: user.organization_id,
          role: user.role,
          user_agent: context.user_agent,
          ip_address: context.ip_address,
        },
        tx,
      );

      return { user, ...session };
    });
  }
}
