// Path: apps/crm-web/src/modules/auth/api/passkey_login.api.ts

import { api_request } from "@/lib/api/api_request";
import type { startAuthentication } from "@simplewebauthn/browser";
import { T_Login_Response } from "../types/login.types";

type T_Authentication_Options = Parameters<
  typeof startAuthentication
>[0]["optionsJSON"];
type T_Authentication_Response = Awaited<
  ReturnType<typeof startAuthentication>
>;

type T_Login_Challenge = {
  challenge_id: string;
  options: T_Authentication_Options;
};

export function begin_passkey_login(signal: AbortSignal) {
  return api_request<T_Login_Challenge>("auth/passkey/options", {
    method: "POST",
    credentials: "include",
    signal,
  });
}

export function finish_passkey_login(
  challenge_id: string,
  credential: T_Authentication_Response,
  signal: AbortSignal,
) {
  return api_request<T_Login_Response>("auth/passkey/verify", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ challenge_id, credential }),
    signal,
  });
}
