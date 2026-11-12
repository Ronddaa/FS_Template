// Path: apps/crm-web/src/modules/auth/hooks/use_passkey_login.hook.ts

"use client";

import { useEffect } from "react";
import { useAuth } from "../Auth_Provider/Auth_Provider";
import {
  browserSupportsWebAuthnAutofill,
  startAuthentication,
  WebAuthnAbortService,
} from "@simplewebauthn/browser";
import {
  begin_passkey_login,
  finish_passkey_login,
} from "../api/passkey_login.api";

export function usePasskey_Login(
  enabled: boolean,
  on_error: (message: string) => void,
) {
  const { set_auth_session } = useAuth();

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    const { signal } = controller;
    let waiting_for_device = false;

    async function sign_in() {
      const supported = await browserSupportsWebAuthnAutofill();
      if (signal.aborted || !supported) return;

      const { challenge_id, options } = await begin_passkey_login(signal);
      if (signal.aborted) return;

      waiting_for_device = true;
      const credential = await startAuthentication({
        optionsJSON: options,
        useBrowserAutofill: true,
      });
      waiting_for_device = false;
      if (signal.aborted) return;

      const session = await finish_passkey_login(
        challenge_id,
        credential,
        signal,
      );
      if (!signal.aborted) set_auth_session(session);
    }

    void sign_in().catch((error: unknown) => {
      waiting_for_device = false;
      if (signal.aborted) return;

      if (error instanceof Error && error.name === "NotAllowedError") {
        on_error(
          "Passkey sign-in was cancelled or timed out. Focus Email to try again.",
        );
        return;
      }

      on_error(
        "Passkey sign-in could not be completed. Focus Email to try again",
      );
    });

    return () => {
      controller.abort();
      if (waiting_for_device) WebAuthnAbortService.cancelCeremony();
    };
  }, [enabled, on_error, set_auth_session]);
}
