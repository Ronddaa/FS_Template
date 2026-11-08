// Path: apps/crm-api/src/bootstrap/services/bootstrap_token.service.ts

import { ConflictException, Injectable } from '@nestjs/common';
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
            })

            if (!organization) {
                throw new ConflictException("CRM organization already exists")
            }
    });
  }
}
