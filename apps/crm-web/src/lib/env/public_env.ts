function get_api_url(): string {
  const api_url = process.env.NEXT_PUBLIC_API_URL;

  if (!api_url) {
    throw new Error("NEXT_PUBLIC_API_URL is not defiend");
  }

  try {
    new URL(api_url);
  } catch {
    throw new Error("NEXT_PUBLIC_API_URL must be a valid URL");
  }

  return api_url.replace(/\/+$/, "");
}

export const public_env = Object.freeze({
  api_url: get_api_url(),
});
