// Path: apps/crm-web/src/modules/bootstrap/Passkey_Enrollment_Form/Passkey_Enrollment_Form.tsx
"use client";

import { useState } from "react";
import styles from "./Passkey_Enrollment_Form.module.scss";
import {
  get_owner_passkey_options,
  request_passkey_code,
  save_owner_passkey,
  verify_passkey_code,
} from "../api/bootstrap.api";
import { startRegistration } from "@simplewebauthn/browser";

export default function Passkey_Enrollment_Form() {
  const [is_submitting, set_is_submitting] = useState(false);
  const [pending_verification, set_pending_verification] = useState<{
    email: string;
    request_id: string;
  } | null>(null);
  const [error_message, set_error_message] = useState("");
  const [enrollment_token, set_enrollment_token] = useState("");
  const [passkey_created, set_passkey_created] = useState(false);

  async function send_code(form: HTMLFormElement) {
    if (is_submitting) return;

    const fields = new FormData(form);
    const email = String(fields.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(fields.get("password") ?? "");

    set_error_message("");
    set_is_submitting(true);

    try {
      const { request_id } = await request_passkey_code(email, password);
      form.reset();
      set_pending_verification({ email, request_id });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not request a verification code";

      set_error_message(message);
    } finally {
      set_is_submitting(false);
    }
  }

  async function verify_code(form: HTMLFormElement) {
    if (!pending_verification || is_submitting) return;

    const code = String(new FormData(form).get("code") ?? "").trim();
    set_error_message("");
    set_is_submitting(true);

    try {
      const result = await verify_passkey_code(
        pending_verification.request_id,
        code,
      );
      set_enrollment_token(result.enrollment_token);
    } catch (error: unknown) {
      set_error_message(
        error instanceof Error ? error.message : "Could not verify the code.",
      );
    } finally {
      set_is_submitting(false);
    }
  }

  async function create_passkey() {
    if (!enrollment_token || is_submitting) return;

    set_is_submitting(true);
    set_error_message("");

    try {
      const options = await get_owner_passkey_options(enrollment_token);
      const credential = await startRegistration({ optionsJSON: options });
      await save_owner_passkey(enrollment_token, credential);

      set_passkey_created(true);
      set_enrollment_token("");
      set_pending_verification(null);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not create your passkey.";

      set_error_message(message);
    } finally {
      set_is_submitting(false);
    }
  }

  if (passkey_created) {
    return (
      <section className={styles.section_passkey_enrollment_form}>
        <h1 className={styles.title}>Passkey created</h1>
        <p className={styles.text}>
          Your owner account is ready for passkey sign-in.
        </p>
      </section>
    );
  }

  if (enrollment_token) {
    return (
      <section className={styles.section_passkey_enrollment_form}>
        <h1 className={styles.title}>Create your passkey</h1>
        <p className={styles.text}>
          Use your device to create a passkey for your CRM owner account.
        </p>

        <button
          className={styles.create_btn}
          type="button"
          disabled={is_submitting}
          onClick={() => void create_passkey()}
        >
          {is_submitting ? "Creating passkey..." : "Create passkey"}
        </button>

        {error_message && (
          <>
            <p className={styles.text} role="alert">
              {error_message}
            </p>
            <button
              className={styles.verify_btn}
              type="button"
              disabled={is_submitting}
              onClick={() => {
                set_enrollment_token("");
                set_pending_verification(null);
                set_error_message("");
              }}
            >
              Verify identity again
            </button>
          </>
        )}
      </section>
    );
  }

  if (pending_verification) {
    return (
      <section className={styles.section_passkey_enrollment_form}>
        <h1 className={styles.title}>Enter your verification code</h1>
        <p className={styles.text}>
          We sent a six-digit verification code to{" "}
          <strong>{pending_verification.email}</strong>. The code is valid for
          10 minuts.
        </p>

        <form
          method="post"
          onSubmit={(event) => {
            event.preventDefault();
            void verify_code(event.currentTarget);
          }}
        >
          <div className={styles.wrapper_input}>
            <label htmlFor="code">Verification code</label>
            <input
              className={styles.input}
              id="code"
              type="text"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              minLength={6}
              required
            />
          </div>
          <button
            className={styles.submit_btn}
            type="submit"
            disabled={is_submitting}
          >
            {is_submitting ? "Verifying..." : "Verify code"}
          </button>
          <button
            className={styles.resend_btn}
            type="button"
            disabled={is_submitting}
            onClick={() => {
              set_pending_verification(null);
              set_error_message("");
            }}
          >
            Request a new code
          </button>
        </form>
        {error_message && (
          <p className={styles.text} role="alert">
            {error_message}
          </p>
        )}
      </section>
    );
  }

  return (
    <section className={styles.section_passkey_enrollment_form}>
      <h1 className={styles.title}>Verify your identity</h1>
      <p className={styles.text}>
        Enter your owner email and password to set up your first passkey.
      </p>

      <form
        method="post"
        onSubmit={(event) => {
          event.preventDefault();
          void send_code(event.currentTarget);
        }}
      >
        <fieldset disabled={is_submitting}>
          <div className={styles.wrapper_input}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              className={styles.input}
              type="email"
              name="email"
              id="email"
              autoComplete="email"
              maxLength={150}
              required
            />
          </div>
          <div className={styles.wrapper_input}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <input
              className={styles.input}
              type="password"
              name="password"
              id="password"
              autoComplete="current-password"
              maxLength={128}
              required
            />
          </div>

          <button className={styles.form_btn} type="submit">
            {is_submitting ? "Sending..." : "Send verification code"}
          </button>
        </fieldset>
        {error_message && (
          <p className={styles.text} role="alert">
            {error_message}
          </p>
        )}
      </form>
    </section>
  );
}

================================

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

  private async find_enrollment(enrollmet_token: string) {
    const grant_hash = createHash('sha256')
      .update(enrollmet_token)
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

===========================

const enrollment: {
 grant_hash: string;
 user: {
 email: string;
 };
 user_id: string;
 registration_challenge: string | null;
}

==========================

const enrollment: {
 grant_hash: string;
 user: {
 email: string;
 };
 user_id: string;
 registration_challenge: string | null;
}

==========================

Ошибка: Тип "PublicKeyCredentialCreationOptionsJSON" не может быть назначен для типа "import("W:/Ronddaa/CRM/FS_Template/node_modules/.pnpm/@simplewebauthn+browser@13.3.0/node_modules/@simplewebauthn/browser/esm/types/index").PublicKeyCredentialCreationOptionsJSON".
  Типы свойства "excludeCredentials" несовместимы.
    Тип "PublicKeyCredentialDescriptorJSON[] | undefined" не может быть назначен для типа "import("W:/Ronddaa/CRM/FS_Template/node_modules/.pnpm/@simplewebauthn+browser@13.3.0/node_modules/@simplewebauthn/browser/esm/types/index").PublicKeyCredentialDescriptorJSON[] | undefined".
      Тип "PublicKeyCredentialDescriptorJSON[]" не может быть назначен для типа "import("W:/Ronddaa/CRM/FS_Template/node_modules/.pnpm/@simplewebauthn+browser@13.3.0/node_modules/@simplewebauthn/browser/esm/types/index").PublicKeyCredentialDescriptorJSON[]".
        Тип "PublicKeyCredentialDescriptorJSON" не может быть назначен для типа "import("W:/Ronddaa/CRM/FS_Template/node_modules/.pnpm/@simplewebauthn+browser@13.3.0/node_modules/@simplewebauthn/browser/esm/types/index").PublicKeyCredentialDescriptorJSON".
          Типы свойства "type" несовместимы.
            Тип "string" не может быть назначен для типа ""public-key"".
startRegistration.d.ts(10, 5): Ожидаемый тип поступает из свойства "optionsJSON", объявленного здесь в типе "{ optionsJSON: PublicKeyCredentialCreationOptionsJSON; useAutoRegister?: boolean | undefined; }"

======================

Ошибка: Аргумент типа "import("W:/Ronddaa/CRM/FS_Template/node_modules/.pnpm/@simplewebauthn+browser@13.3.0/node_modules/@simplewebauthn/browser/esm/types/index").RegistrationResponseJSON" нельзя назначить параметру типа "RegistrationResponseJSON".
  Типы "response.authenticatorData" несовместимы между этими типами.
    Тип "string | undefined" не может быть назначен для типа "string".
      Тип "undefined" не может быть назначен для типа "string".