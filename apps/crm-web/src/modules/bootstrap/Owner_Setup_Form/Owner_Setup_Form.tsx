// Path: apps/crm-web/src/modules/bootstrap/Owner_Setup_Form/Owner_Setup_Form.tsx
"use client";

import { useState } from "react";
import { useSetup_link_token } from "../hooks/use_setup_link_token.hook";
import styles from "./Owner_Setup_Form.module.scss";
import { start_owner_registration } from "../api/bootstrap.api";

export default function Owner_Setup_Form() {
  const token = useSetup_link_token();
  const [is_submitting, set_is_submitting] = useState(false);
  const [error_message, set_error_message] = useState("");
  const [sent_email, set_sent_email] = useState("");

  async function submit_registration(form: HTMLFormElement) {
    if (!token || is_submitting) return;

    const fields = new FormData(form);
    const field = (name: string) => String(fields.get(name) ?? "");

    const email = field("email").trim().toLowerCase();
    const password = field("password");
    const password_confirmation = field("password_copy");

    set_is_submitting(true);
    set_error_message("");

    try {
      await start_owner_registration({
        token,
        organization_name: field("organization_name").trim(),
        f_name: field("f_name").trim(),
        l_name: field("l_name").trim(),
        email,
        phone: field("phone").trim(),
        password,
      });
    } catch (error: unknown) {
      set_error_message(
        error instanceof TypeError
          ? "Could not reach the CRM. Check your connection."
          : error instanceof Error
            ? error.message
            : "Could not submit your registration",
      );
      return;
    } finally {
      set_is_submitting(false);
    }

    set_sent_email(email);
    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname + window.location.search,
    );

    if (password !== password_confirmation) {
      set_error_message("Passwords do not match.");
      return;
    }
  }

  if (sent_email) {
    return (
      <section className={styles.section_owner_setup_form}>
        <h1 className={styles.title}>Check your email</h1>
        <p className={styles.text}>
          We sent a confirmation link to <strong>{sent_email}</strong>.
        </p>
        <p className={styles.text}>
          Open the email and select Confirm email to continue.
        </p>
      </section>
    );
  }

  if (token === null) {
    return (
      <p className={styles.text} role="status">
        Opening setup…
      </p>
    );
  }

  if (!token) {
    return (
      <section className={styles.section_owner_setup_form}>
        <h1 className={styles.title}>Invalid setup link</h1>
        <p className={styles.text}>
          Open the complete setup link provided for your CRM
        </p>
      </section>
    );
  }

  return (
    <section className={styles.section_owner_setup_form}>
      <h1 className={styles.title}>Set up your CRM</h1>
      <form
        className={styles.form}
        method="post"
        onSubmit={(event) => {
          event.preventDefault();
          void submit_registration(event.currentTarget);
        }}
      >
        <fieldset disabled={is_submitting}>
          <div className={styles.wrapper_input}>
            <label className={styles.label} htmlFor="organization_name">
              Organization name
            </label>
            <input
              className={styles.input}
              type="text"
              name="organization_name"
              id="organization_name"
              autoComplete="organization"
              maxLength={150}
              required
            />
          </div>
          <div className={styles.wrapper_full_name}>
            <div className={styles.wrapper_input}>
              <label className={styles.label} htmlFor="f_name">
                First name
              </label>
              <input
                className={styles.input}
                type="text"
                name="f_name"
                id="f_name"
                autoComplete="given-name"
                minLength={2}
                maxLength={100}
                required
              />
            </div>
            <div className={styles.wrapper_input}>
              <label className={styles.label} htmlFor="l_name">
                Last name
              </label>
              <input
                className={styles.input}
                type="text"
                name="l_name"
                id="l_name"
                autoComplete="family-name"
                minLength={2}
                maxLength={100}
                required
              />
            </div>
          </div>
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
              maxLength={254}
              required
            />
          </div>
          <div className={styles.wrapper_input}>
            <label className={styles.label} htmlFor="phone">
              Phone
            </label>
            <input
              className={styles.input}
              type="tel"
              name="phone"
              id="phone"
              autoComplete="tel"
              pattern={String.raw`\+[1-9][0-9]{1,14}`}
              maxLength={16}
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
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
            />
          </div>
          <div className={styles.wrapper_input}>
            <label className={styles.label} htmlFor="password_copy">
              Confirm password
            </label>
            <input
              className={styles.input}
              type="password"
              name="password_copy"
              id="password_copy"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
            />
          </div>

          <button className={styles.form_btn} type="submit">
            {is_submitting ? "Sending..." : "Send confirmation email"}
          </button>
        </fieldset>
        {error_message && <p role="alert">{error_message}</p>}
      </form>
    </section>
  );
}
