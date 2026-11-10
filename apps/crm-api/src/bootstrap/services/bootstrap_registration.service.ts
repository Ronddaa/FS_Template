// Path: apps/crm-api/src/bootstrap/services/bootstrap_registration.service.ts

import { ConflictException, Injectable } from '@nestjs/common';
import { Database_Service } from 'src/database/database.service';
import { Bootstrap_Token_Service } from './bootstrap_token.service';
import { Password_Service } from 'src/auth/services/password.service';
import { Start_Setup_DTO } from '../dto/start_setup.dto';
import { REGISTRATION_TTL_MS } from '../constants/registration.constants';
import { Bootstrap_Email_Token_Service } from './bootstrap_email_token.service';
import { Bootstrap_Email_Service } from './bootstrap_email.service';

@Injectable()
export class Bootstrap_Registration_Service {
  constructor(
    private readonly db_service: Database_Service,
    private readonly token_service: Bootstrap_Token_Service,
    private readonly pass_service: Password_Service,
    private readonly email_token_service: Bootstrap_Email_Token_Service,
    private readonly email_service: Bootstrap_Email_Service,
  ) {}

  async start_registration(dto: Start_Setup_DTO): Promise<void> {
    const registration = await this.db_service.$transaction(
      async (transaction) => {
        await this.token_service.consume_token(transaction, dto.token);

        const pass_hash = await this.pass_service.hash_pass(dto.password);

        return transaction.setup_Registration.create({
          data: {
            setup_id: 1,
            organization_name: dto.organization_name,
            f_name: dto.f_name,
            l_name: dto.l_name,
            email: dto.email,
            phone: dto.phone,
            pass_hash,
            expires_at: new Date(Date.now() + REGISTRATION_TTL_MS),
          },
          select: { id: true },
        });
      },
    );

    const confirmation = await this.email_token_service.issue_first_email_token(
      registration.id,
    );

    await this.email_service.send_confirmation(
      confirmation.email,
      confirmation.token,
    );
  }

  async confirm_email(email_token: string): Promise<void> {
    await this.db_service.$transaction(async (transaction) => {
      const setup_rows = await transaction.$queryRaw<{ id: number }[]>`
        SELECT id
        FROM installation_setup
        WHERE id = 1 AND status = 'EMAIL_PENDING'
        FOR UPDATE
      `;

      if (setup_rows.length !== 1) {
        throw new ConflictException('Email confirmation is unavailable.');
      }

      const registration_id =
        await this.email_token_service.consume_email_token(
          transaction,
          email_token,
        );

      const registration =
        await transaction.setup_Registration.findUniqueOrThrow({
          where: { id: registration_id },
          select: {
            organization_name: true,
            f_name: true,
            l_name: true,
            email: true,
            phone: true,
            pass_hash: true,
            email_verified_at: true,
          },
        });

      if (!registration.email_verified_at) {
        throw new ConflictException('Email verification is incomplete.');
      }

      const organization = await transaction.organization.create({
        data: { name: registration.organization_name },
        select: { id: true },
      });

      const owner_role = await transaction.role.create({
        data: {
          organization_id: organization.id,
          code: 'OWNER',
          name: 'Owner',
          is_system: true,
        },
        select: { id: true },
      });

      await transaction.user.create({
        data: {
          organization_id: organization.id,
          role: 'OWNER',
          role_id: owner_role.id,
          status: 'MFA_SETUP_REQUIRED',
          f_name: registration.f_name,
          l_name: registration.l_name,
          email: registration.email,
          phone: registration.phone,
          pass_hash: registration.pass_hash,
          email_verified_at: registration.email_verified_at,
          approved_at: registration.email_verified_at,
        },
        select: {
          id: true,
        },
      });

      await transaction.setup_Registration.delete({
        where: { id: registration_id },
      });

      await transaction.$executeRaw`
        UPDATE installation_setup
        SET status = 'COMPLETED',
          completed_at = clock_timestamp(),
          updated_at = clock_timestamp()
        WHERE id = 1
      `;
    });
  }
}
