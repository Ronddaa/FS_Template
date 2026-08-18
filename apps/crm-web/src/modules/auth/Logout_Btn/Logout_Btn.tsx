"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../Auth_Provider/Auth_Provider";

export default function Logout_Btn() {
  const router = useRouter();
  const { logout_session } = useAuth();

  const [is_logging_out, set_is_logging_out] = useState(false);
  const [error_message, set_error_message] = useState<string | null>(null);

  async function handle_logout(): Promise<void> {
    if (is_logging_out) {
      return;
    }

    set_error_message(null);
    set_is_logging_out(true);

    try {
      await logout_session();
      router.replace("/login");
    } catch {
      set_error_message("Unable to sign out. Please try again.");
      set_is_logging_out(false);
    }
  }

  return (
    <div>
      {error_message && <p role="alert">{error_message}</p>}

      <button
        type="button"
        onClick={handle_logout}
        disabled={is_logging_out}
        aria-busy={is_logging_out}
      >
        {is_logging_out ? "Signing out..." : "Sign out"}
      </button>
    </div>
  );
}
