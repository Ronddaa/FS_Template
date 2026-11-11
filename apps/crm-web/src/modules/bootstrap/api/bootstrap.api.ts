// Path: apps/crm-web/src/modules/bootstrap/api/bootstrap.api.ts

import { api_request } from "@/lib/api/api_request";
import { T_Start_Setup_Request } from "../types/bootstrap.types";

export function start_owner_registration(
  registration_data: T_Start_Setup_Request,
): Promise<void> {
  return api_request<void>("bootstrap/start", {
    method: "POST",
    credentials: "omit",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(registration_data),
  });
}

export function confirm_owner_email(email_token: string): Promise<void> {
  return api_request<void>("bootstrap/confirm-email", {
    method: "POST",
    credentials: "omit",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: email_token }),
  });
}

export function request_passkey_code(
  email: string,
  password: string,
): Promise<{ request_id: string }> {
  return api_request<{ request_id: string }>("bootstrap/passkey/request-code", {
    method: "POST",
    credentials: "omit",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export function verify_passkey_code(
  request_id: string,
  code: string,
): Promise<{ enrollment_token: string }> {
  return api_request<{ enrollment_token: string }>(
    "bootstrap/passkey/verify-code",
    {
      method: "POST",
      credentials: "omit",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request_id, code }),
    },
  );
}
