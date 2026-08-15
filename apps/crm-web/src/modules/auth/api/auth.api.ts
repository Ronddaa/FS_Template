import { api_request } from "@/lib/api/api_request";
import {
  T_Registration_Request,
  T_Registration_Responce,
} from "../types/registration.types";
import { T_Login_Request, T_Login_Response } from "../types/login.types";

export function register_user(
  registration_data: T_Registration_Request,
): Promise<T_Registration_Responce> {
  return api_request<T_Registration_Responce>("auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(registration_data),
  });
}

export function login_user(
  login_data: T_Login_Request,
): Promise<T_Login_Response> {
  return api_request<T_Login_Response>("auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(login_data),
  });
}
