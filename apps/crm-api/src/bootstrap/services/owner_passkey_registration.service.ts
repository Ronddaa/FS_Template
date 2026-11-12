// Path: apps/crm-api/src/bootstrap/services/owner_passkey_registration.service.ts

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  type RegistrationResponseJSON,
} from '@simplewebauthn/server';
import { createHash } from 'crypto';
import { Database_Service } from 'src/database/database.service';

@Injectable()
export class Owner_Passkey_Registration_Service {
  private readonly expected_origin: string;
  private readonly rp_id: string;

  constructor(
    private readonly db_service: Database_Service,
    config_service: ConfigService,
  ) {
    const origin = new URL(config_service.getOrThrow<string>('CRM_WEB_ORIGIN'));
    this.expected_origin = origin.origin;
    this.rp_id = origin.hostname;
  }

  private invalid_enrollment() {
    return new ForbiddenException(
      'Passkey setup has expired or is unavailable. Verify your identity again.',
    );
  }

  private async find_enrollment(enrollment_token: string) {
    const grant_hash = createHash('sha256')
      .update(enrollment_token)
      .digest('hex');

    const enrollment = await this.db_service.owner_Passkey_Enrollment.findFirst(
      {
        where: {
          grant_hash,
          grant_expires_at: {
            gt: new Date(),
          },
          user: {
            role: 'OWNER',
            status: 'MFA_SETUP_REQUIRED',
            email_verified_at: { not: null },
          },
        },
        select: {
          user_id: true,
          registration_challenge: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      },
    );

    if (!enrollment) throw this.invalid_enrollment();

    return { ...enrollment, grant_hash };
  }

  async begin_registration(enrollment_token: string) {
    const enrollment = await this.find_enrollment(enrollment_token);

    const options = await generateRegistrationOptions({
      rpName: 'CRM',
      rpID: this.rp_id,
      userID: new TextEncoder().encode(enrollment.user_id),
      userName: enrollment.user.email,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'required',
      },
    });

    const saved = await this.db_service.owner_Passkey_Enrollment.updateMany({
      where: {
        user_id: enrollment.user_id,
        grant_hash: enrollment.grant_hash,
        grant_expires_at: { gt: new Date() },
      },
      data: { registration_challenge: options.challenge },
    });

    if (saved.count !== 1) throw this.invalid_enrollment();

    return options;
  }

  async finish_registration(
    enrollment_token: string,
    response: RegistrationResponseJSON,
  ): Promise<void> {
    const enrollment = await this.find_enrollment(enrollment_token);
    const challenge = enrollment.registration_challenge;

    if (!challenge) throw this.invalid_enrollment();

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: challenge,
      expectedOrigin: this.expected_origin,
      expectedRPID: this.rp_id,
      requireUserVerification: true,
    }).catch(() => {
      throw new BadRequestException('Passkey verification failed.');
    });

    if (!verification.verified || !verification.registrationInfo) {
      throw new BadRequestException('Passkey verification failed.');
    }

    const { credential, credentialDeviceType, credentialBackedUp } =
      verification.registrationInfo;

    await this.db_service.$transaction(async (transaction) => {
      const owner = await transaction.user.updateMany({
        where: {
          id: enrollment.user_id,
          role: 'OWNER',
          status: 'MFA_SETUP_REQUIRED',
          email_verified_at: { not: null },
        },
        data: { status: 'ACTIVE' },
      });

      if (owner.count !== 1) throw this.invalid_enrollment();

      const consumed = await transaction.owner_Passkey_Enrollment.deleteMany({
        where: {
          user_id: enrollment.user_id,
          grant_hash: enrollment.grant_hash,
          grant_expires_at: { gt: new Date() },
          registration_challenge: challenge,
        },
      });

      if (consumed.count !== 1) throw this.invalid_enrollment();

      await transaction.user_Passkey.create({
        data: {
          credential_id: credential.id,
          user_id: enrollment.user_id,
          public_key: new Uint8Array(credential.publicKey),
          counter: BigInt(credential.counter),
          transports: credential.transports ?? [],
          device_type: credentialDeviceType,
          backed_up: credentialBackedUp,
        },
      });
    });
  }
}
