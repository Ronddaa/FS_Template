import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@crm/database';
import { createHash, randomBytes } from 'node:crypto';
import { Database_Service } from '../../database/database.service';

type Email_Confirmation = {
  email: string;
  token: string;
};

@Injectable()
export class Bootstrap_Email_Token_Service {
  constructor(private readonly db_service: Database_Service) {}

  issue_first_email_token(
    registration_id: string,
  ): Promise<Email_Confirmation> {
    return this.issue_email_token(registration_id, 'first');
  }

  reissue_email_token(registration_id: string): Promise<Email_Confirmation> {
    return this.issue_email_token(registration_id, 'resend');
  }

  async consume_email_token(
    transaction: Prisma.TransactionClient,
    email_token: string,
  ): Promise<string> {
    const token_hash = createHash('sha256').update(email_token).digest('hex');

    const rows = await transaction.$queryRaw<{ id: string }[]>`
    UPDATE "setup_registration" AS registration
    SET
      "email_verified_at" = clock_timestamp(),
      "email_token_hash" = NULL,
      "email_token_expires_at" = NULL,
      "updated_at" = clock_timestamp()
    FROM "installation_setup" AS setup
    WHERE setup."id" = 1
      AND registration."setup_id" = setup."id"
      AND setup."status" = 'EMAIL_PENDING'
      AND setup."completed_at" IS NULL
      AND registration."email_verified_at" IS NULL
      AND registration."email_token_hash" = ${token_hash}
      AND registration."email_token_expires_at" > clock_timestamp()
      AND registration."expires_at" > clock_timestamp()
    RETURNING registration."id"
  `;

    const registration = rows[0];

    if (!registration) {
      throw new ForbiddenException(
        'This confirmation link is invalid or has expired',
      );
    }

    return registration.id;
  }

  private async issue_email_token(
    registration_id: string,
    mode: 'first' | 'resend',
  ): Promise<Email_Confirmation> {
    const token = randomBytes(32).toString('base64url');
    const token_hash = createHash('sha256').update(token).digest('hex');

    const issuance_condition =
      mode === 'first'
        ? Prisma.sql`registration."email_token_hash" IS NULL`
        : Prisma.sql`(
            registration."email_token_issued_at" IS NULL
            OR registration."email_token_issued_at"
              <= clock_timestamp() - INTERVAL '60 seconds'
          )`;

    const rows = await this.db_service.$queryRaw<{ email: string }[]>`
      UPDATE "setup_registration" AS registration
      SET
        "email_token_hash" = ${token_hash},
        "email_token_issued_at" = clock_timestamp(),
        "email_token_expires_at" = registration."expires_at",
        "updated_at" = clock_timestamp()
      FROM "installation_setup" AS setup
      WHERE setup."id" = 1
        AND registration."setup_id" = setup."id"
        AND registration."id" = ${registration_id}::uuid
        AND setup."status" = 'EMAIL_PENDING'
        AND setup."completed_at" IS NULL
        AND registration."email_verified_at" IS NULL
        AND registration."expires_at" > clock_timestamp()
        AND ${issuance_condition}
      RETURNING registration."email"
    `;

    const recipient = rows[0];

    if (!recipient) {
      throw new ConflictException(
        'A confirmation email cannot be issued at this time',
      );
    }

    return { email: recipient.email, token };
  }
}
