// Path: apps/crm-api/src/bootstrap/services/bootstrap_token.service.ts

import type { Prisma } from '@crm/database';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { Database_Service } from 'src/database/database.service';

const SETUP_ID = 1;
const TOKEN_BYTES = 32;

@Injectable()
export class Bootstrap_Token_Service {
  constructor(private readonly db_service: Database_Service) {}

  async issue_token(): Promise<string> {
    return this.db_service.$transaction(async (transaction) => {
      await transaction.$executeRaw`
            INSERT INTO "installation_setup" ("id", "updated_at")
            VALUES (${SETUP_ID}, clock_timestamp())
            ON CONFLICT ("id") DO NOTHING
            `;

      await transaction.$queryRaw`
            SELECT "id"
            FROM "installation_setup"
            WHERE "id" = ${SETUP_ID}
            FOR UPDATE
            `;

      const organization = await transaction.organization.findFirst({
        select: { id: true },
      });

      if (organization) {
        throw new ConflictException('CRM organization already exists');
      }

      const token = randomBytes(TOKEN_BYTES).toString('base64url');
      const token_hash = createHash('sha256').update(token).digest('hex');

      const updated_rows = await transaction.$executeRaw`
  UPDATE "installation_setup"
  SET
    "status" = 'TOKEN_ISSUED',
    "token_hash" = ${token_hash},
    "token_expires_at" = clock_timestamp() + INTERVAL '15 minutes',
    "updated_at" = clock_timestamp()
  WHERE "id" = ${SETUP_ID}
    AND "completed_at" IS NULL
    AND (
      "status" = 'NOT_STARTED'
      OR (
        "status" = 'TOKEN_ISSUED'
        AND "token_expires_at" <= clock_timestamp()
      )
    )
`;

      if (updated_rows !== 1) {
        throw new ConflictException(
          'Setup token cannot be issued in the current installation state',
        );
      }

      return token;
    });
  }

  async consume_token(
    transaction: Prisma.TransactionClient,
    token: string,
  ): Promise<void> {
    const token_hash = createHash('sha256').update(token).digest('hex');

    const updated_rows = await transaction.$executeRaw`
  UPDATE "installation_setup"
  SET
    "status" = 'EMAIL_PENDING',
    "token_hash" = NULL,
    "token_expires_at" = NULL,
    "updated_at" = clock_timestamp()
  WHERE "id" = ${SETUP_ID}
    AND "status" = 'TOKEN_ISSUED'
    AND "completed_at" IS NULL
    AND "token_hash" = ${token_hash}
    AND "token_expires_at" > clock_timestamp()
`;

    if (updated_rows !== 1) {
      throw new ForbiddenException('Setup link is invalid or expired');
    }
  }
}
