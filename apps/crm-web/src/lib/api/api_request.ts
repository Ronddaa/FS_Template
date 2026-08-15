import { public_env } from "../env/public_env";
import { Api_Request_Error } from "./api_request_error";

function is_record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function get_error_message(error_data: unknown, status_code: number): string {
  if (!is_record(error_data)) {
    return `API request failed with status ${status_code}`;
  }

  const message = error_data.message;

  if (typeof message === "string" && message.length > 0) {
    return message;
  }

  if (Array.isArray(message)) {
    const messages = message.filter(
      (item): item is string => typeof item === "string",
    );

    if (messages.length > 0) {
      return messages.join(", ");
    }
  }

  return `API request failed with status ${status_code}`;
}

function get_error_code(error_data: unknown): string | undefined {
  if (!is_record(error_data)) {
    return undefined;
  }

  return typeof error_data.code === "string" ? error_data.code : undefined;
}

export async function api_request<Response_Type>(
  path: string,
  options: RequestInit = {},
): Promise<Response_Type> {
  const normalized_path = path.replace(/^\/+/, "");
  const headers = new Headers(options.headers);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const response = await fetch(`${public_env.api_url}/${normalized_path}`, {
    ...options,
    headers,
    cache: options.cache ?? "no-store",
  });

  if (!response.ok) {
    const error_data: unknown = await response.json().catch(() => null);

    throw new Api_Request_Error({
      message: get_error_message(error_data, response.status),
      status_code: response.status,
      code: get_error_code(error_data),
    });
  }

  if (response.status === 204) {
    return undefined as Response_Type;
  }

  return response.json() as Promise<Response_Type>;
}
