// Path: apps/crm-api/src/bootstrap/services/owner_passkey_enrollment.service.ts

import {
  HttpException,
  HttpStatus,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { Password_Service } from 'src/auth/services/password.service';
import { Database_Service } from 'src/database/database.service';
import { Bootstrap_Email_Service } from './bootstrap_email.service';
import { ConfigService } from '@nestjs/config';
import { createHash, createHmac, randomBytes, randomInt } from 'crypto';

@Injectable()
export class Owner_Passkey_Enrollment_Service {
  private readonly code_secret: Buffer;

  constructor(
    private readonly db_service: Database_Service,
    private readonly pass_service: Password_Service,
    private readonly email_service: Bootstrap_Email_Service,
    config_service: ConfigService,
  ) {
    const secret = config_service.getOrThrow<string>(
      'PASSKEY_ENROLLMENT_CODE_SECRET',
    );

    if (!/^[a-fA-F0-9]{64}$/.test(secret)) {
      throw new Error(
        'PASSKEY_ENROLLMENT_CODE_SECRET must contain 64 hex characters',
      );
    }

    this.code_secret = Buffer.from(secret, 'hex');
  }

  async request_code(
    email: string,
    password: string,
  ): Promise<{ request_id: string }> {
    const owner = await this.db_service.user.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        role: 'OWNER',
        status: 'MFA_SETUP_REQUIRED',
        email_verified_at: { not: null },
      },
      select: {
        id: true,
        email: true,
        pass_hash: true,
      },
    });

    if (
      !owner ||
      !(await this.pass_service.verify_pass(owner.pass_hash, password))
    ) {
      throw new UnauthorizedException(
        'Invalid credentials or setup unavailable.',
      );
    }

    const request_id = randomBytes(32).toString('base64url');
    const request_hash = createHash('sha256').update(request_id).digest('hex');
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const code_hash = this.hash_code(owner.id, request_id, code);

    const updated_rows = await this.db_service.$executeRaw`
      WITH eligible_owner AS (
        SELECT id
        FROM users
        WHERE id = ${owner.id}::uuid
          AND email = ${owner.email}
          AND pass_hash = ${owner.pass_hash}
          AND role = 'OWNER'
          AND status = 'MFA_SETUP_REQUIRED'
          AND email_verified_at IS NOT NULL
        FOR UPDATE
      )
        INSERT INTO owner_passkey_enrollments AS enrollment
      (user_id, request_hash, code_hash, issued_at, expires_at, attempts)
        SELECT id, ${request_hash}, ${code_hash}, statement_timestamp(),
       statement_timestamp() + INTERVAL '10 minutes', 0
        FROM eligible_owner
        ON CONFLICT (user_id) DO UPDATE
        SET request_hash = EXCLUDED.request_hash,
          code_hash = EXCLUDED.code_hash,
          grant_hash = NULL,
          registration_challenge = NULL,
          grant_expires_at = NULL,
          issued_at = EXCLUDED.issued_at,
          expires_at = EXCLUDED.expires_at,
          attempts = CASE
            WHEN enrollment.expires_at <= EXCLUDED.issued_at THEN 0
            ELSE enrollment.attempts
          END
      WHERE enrollment.issued_at <= EXCLUDED.issued_at - INTERVAL '60 seconds'
    `;

    if (updated_rows !== 1) {
      throw new HttpException(
        'A new code is unavailable. Wait at least 60 seconds before trying again.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    try {
      await this.email_service.send_passkey_enrollment_code(owner.email, code);
    } catch {
      throw new ServiceUnavailableException(
        'Email delivery could not be confirmed. Check your inbox or request a new code after 60 seconds.',
      );
    }

    return { request_id };
  }

  async verify_code(
    request_id: string,
    code: string,
  ): Promise<{ enrollment_token: string }> {
    const request_hash = createHash('sha256').update(request_id).digest('hex');
    const invalid_code = () =>
      new UnauthorizedException('The verification code is invalid or expired.');

    const enrollment =
      await this.db_service.owner_Passkey_Enrollment.findUnique({
        where: { request_hash },
        select: { user_id: true },
      });

    if (!enrollment) throw invalid_code();

    const candidate_hash = this.hash_code(enrollment.user_id, request_id, code);
    const enrollment_token = randomBytes(32).toString('base64url');
    const grant_hash = createHash('sha256')
      .update(enrollment_token)
      .digest('hex');

    const rows = await this.db_service.$queryRaw<{ verified: boolean }[]>`
    UPDATE owner_passkey_enrollments AS e
    SET attempts = e.attempts + 1,
        grant_hash = CASE
          WHEN e.code_hash = ${candidate_hash} THEN ${grant_hash}
          ELSE NULL
        END,
        grant_expires_at = CASE
          WHEN e.code_hash = ${candidate_hash}
          THEN clock_timestamp() + INTERVAL '5 minutes'
          ELSE NULL
        END
    FROM users AS u
    WHERE e.request_hash = ${request_hash}
      AND e.user_id = u.id
      AND u.role = 'OWNER'
      AND u.status = 'MFA_SETUP_REQUIRED'
      AND u.email_verified_at IS NOT NULL
      AND e.grant_hash IS NULL
      AND e.attempts < 5
      AND e.expires_at > clock_timestamp()
    RETURNING e.grant_hash IS NOT NULL AS verified
  `;

    if (!rows[0]?.verified) throw invalid_code();

    return { enrollment_token };
  }

  private hash_code(user_id: string, request_id: string, code: string): string {
    return createHmac('sha256', this.code_secret)
      .update(`${user_id}:${request_id}:${code}`)
      .digest('hex');
  }
}
