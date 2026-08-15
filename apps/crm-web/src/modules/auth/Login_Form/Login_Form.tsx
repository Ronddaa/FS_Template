'use client'

import { useRouter } from "next/navigation";
import styles from "./Login_Form.module.scss";
import clsx from "clsx";
import { useAuth } from "../Auth_Provider/Auth_Provider";
import { type SyntheticEvent, useState } from "react";
import type { T_Login_Request } from "../types/login.types";
import { login_user } from "../api/auth.api";
import { Api_Request_Error } from "@/lib/api/api_request_error";

export default function Login_Form() {
  const router = useRouter();
  const { set_auth_session } = useAuth();

  const [is_submitting, set_is_submitting] = useState(false);
  const [error_message, set_error_message] = useState<string | null>(null);

  async function handle_submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (is_submitting) {
      return;
    }

    const form_data = new FormData(event.currentTarget);

    const login_data: T_Login_Request = {
      email: String(form_data.get("email") ?? "")
        .trim()
        .toLowerCase(),
      password: String(form_data.get("password") ?? "").trim(),
    };

    set_error_message(null);
    set_is_submitting(true);

    try {
      const login_result = await login_user(login_data);

      set_auth_session(login_result);
      router.replace("/");
    } catch (error: unknown) {
      if (error instanceof Api_Request_Error) {
        if (error.code === "ACCOUNT_PENDING") {
          router.replace("/approval-pending");
          return;
        }

        set_error_message(error.message);
        return;
      }

      set_error_message("Unable to connect to the server. Please try again.");
    } finally {
      set_is_submitting(false);
    }
  }
  return (
    <section className={styles.section_login_form}>
      <div className="container">
        <form onSubmit={handle_submit} aria-busy={is_submitting}>
          {error_message && <div role="alert">{error_message}</div>}

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
              autoComplete="current-password"
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
            {is_submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </section>
  );
}
