// Path: apps/crm-web/src/modules/bootstrap/Email_Confirmation/Email_Confirmation.tsx
"use client";

import { useRef, useState } from "react";
import { useSetup_link_token } from "../hooks/use_setup_link_token.hook";
import styles from "./Email_Confirmation.module.scss";
import { confirm_owner_email } from "../api/bootstrap.api";
import Link from "next/link";

export default function Email_Confirmation() {
  const token = useSetup_link_token();
  const request_pending = useRef(false);

  const [is_submitting, set_is_submitting] = useState(false);
  const [is_confirmed, set_is_confirmed] = useState(false);
  const [error_message, set_error_message] = useState("");

  async function confirm_email() {
    if (!token || request_pending.current || is_confirmed) return;

    request_pending.current = true;
    set_is_submitting(true);
    set_error_message("");

    try {
      await confirm_owner_email(token);
    } catch (error: unknown) {
      let message = "Could not confirm your email.";

      if (error instanceof TypeError) {
        message =
          "Could not reach the CRM. Check your connection and try again.";
      } else if (error instanceof Error) {
        message = error.message;
      }

      set_error_message(message);
      return;
    } finally {
      request_pending.current = false;
      set_is_submitting(false);
    }

    set_is_confirmed(true);

    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname + window.location.search,
    );
  }

  if (is_confirmed) {
    return (
      <section className={styles.section_email_confirmation}>
        <h1 className={styles.title}>Email confirmed</h1>
        <p className={styles.text}>
          Your orgamization and owner account have been created.
        </p>
        <p className={styles.text}>
          <Link href="/setup/passkey">Set up a passkey</Link>
        </p>
      </section>
    );
  }

  if (!token) {
    return (
      <section className={styles.section_email_confirmation}>
        <h1 className={styles.title}>Invalid confirmation link</h1>
        <p className={styles.text}>
          open the complete confirmation link from your email.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.section_email_confirmation}>
      <h1 className={styles.title}>Confirm your email</h1>
      <p className={styles.text}>
        Confirm your email address to continue setting up your CRM.
      </p>

      <button
        className={styles.ce_btn}
        type="button"
        disabled={is_submitting}
        onClick={() => void confirm_email()}
      >
        {is_submitting ? "Confirming..." : "Confirm email"}
      </button>

      {error_message && (
        <p className={styles.text} role="alert">
          {error_message}
        </p>
      )}
    </section>
  );
}
