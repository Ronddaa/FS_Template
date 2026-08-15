"use client";

import { useRouter } from "next/navigation";
import styles from "./Register_Form.module.scss";
import clsx from "clsx";
import { useState, type SyntheticEvent } from "react";
import type { T_Registration_Request } from "../types/registration.types";
import { register_user } from "../api/auth.api";
import { Api_Request_Error } from "@/lib/api/api_request_error";

export default function Register_Form() {
  const router = useRouter();

  const [is_submitting, set_is_submitting] = useState(false);
  const [error_message, set_error_message] = useState<string | null>(null);

  async function handle_submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (is_submitting) {
      return;
    }

    const form_data = new FormData(event.currentTarget);

    const registration_data: T_Registration_Request = {
      f_name: String(form_data.get("f_name") ?? "").trim(),
      l_name: String(form_data.get("l_name") ?? "").trim(),
      email: String(form_data.get("email") ?? "")
        .trim()
        .toLowerCase(),
      password: String(form_data.get("password") ?? "").trim(),
    };

    set_error_message(null);
    set_is_submitting(true);

    try {
      await register_user(registration_data);
      router.replace("/approval-pending");
    } catch (error: unknown) {
      if (error instanceof Api_Request_Error) {
        set_error_message(error.message);
      } else {
        set_error_message("Unable to connect to the server. Please try again.");
      }
    } finally {
      set_is_submitting(false);
    }
  }

  return (
    <section className={styles.section_register_form}>
      <div className="container">
        <form
          className={styles.register_form}
          onSubmit={handle_submit}
          aria-busy={is_submitting}
        >
          {error_message && (
            <div className={styles.error_banner} role="alert">
              {error_message}
            </div>
          )}

          <div className={styles.w_input}>
            <label htmlFor="f_name" className={styles.label}>
              First name
            </label>

            <input
              id="f_name"
              name="f_name"
              type="text"
              className={styles.input}
              autoComplete="given-name"
              minLength={2}
              maxLength={100}
              required
            />
          </div>

          <div className={styles.w_input}>
            <label htmlFor="l_name" className={styles.label}>
              Last name
            </label>

            <input
              id="l_name"
              name="l_name"
              type="text"
              className={styles.input}
              autoComplete="family-name"
              minLength={2}
              maxLength={100}
              required
            />
          </div>

          <div className={styles.w_input}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              className={styles.input}
              autoComplete="email"
              maxLength={254}
              required
            />
          </div>

          <div className={styles.w_input}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              className={styles.input}
              autoComplete="new-password"
              minLength={12}
              maxLength={128}
              required
            />
          </div>

          <button
            type="submit"
            className={clsx(
              styles.btn_register,
              is_submitting && styles.btn_register_loading,
            )}
            disabled={is_submitting}
          >
            {is_submitting ? "Submitting..." : "Create account"}
          </button>
        </form>
      </div>
    </section>
  );
}
