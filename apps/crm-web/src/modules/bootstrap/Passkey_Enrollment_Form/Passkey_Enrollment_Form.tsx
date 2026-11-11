// Path: apps/crm-web/src/modules/bootstrap/Passkey_Enrollment_Form/Passkey_Enrollment_Form.tsx
"use client";

import { useState } from "react";
import styles from "./Passkey_Enrollment_Form.module.scss";
import {
  request_passkey_code,
  verify_passkey_code,
} from "../api/bootstrap.api";

export default function Passkey_Enrollment_Form() {
  const [is_submitting, set_is_submitting] = useState(false);
  const [pending_verification, set_pending_verification] = useState<{
    email: string;
    request_id: string;
  } | null>(null);
  const [error_message, set_error_message] = useState("");

  const [enrollment_token, set_enrollment_token] = useState("");

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

  if (enrollment_token) {
    return (
      <section className={styles.section_passkey_enrollment_form}>
        <h1 className={styles.title}>Indetity verified</h1>
        <p className={styles.text}>
          Your identity has been verified for passkey setup.
        </p>
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
        {error_message && <p className={styles.text} role="alert">{error_message}</p>}
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
