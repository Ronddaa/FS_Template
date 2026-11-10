// Path: apps/crm-api/src/bootstrap/utils/build_email_confirmation_url.utils.ts

export function build_email_confirmation_url(
  web_origin: URL,
  email_token: string,
): string {
  const confirmation_url = new URL('/setup/verify-email', web_origin);
  confirmation_url.hash = new URLSearchParams({
    token: email_token,
  }).toString();

  return confirmation_url.href;
}
