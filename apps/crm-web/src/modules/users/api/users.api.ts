import { T_Authenticated_Api_Request } from "@/modules/auth/types/authenticated_api_request.types";
import { T_Get_Users_Query, T_Get_Users_Response } from "../types/users.types";

export function get_users(
  authenticated_api_request: T_Authenticated_Api_Request,
  query: T_Get_Users_Query = {},
): Promise<T_Get_Users_Response> {
  const search_params = new URLSearchParams();

  if (query.status) {
    search_params.set("status", query.status);
  }
  if (query.role) {
    search_params.set("role", query.role);
  }
  if (query.page !== undefined) {
    search_params.set("page", String(query.page));
  }
  if (query.limit !== undefined) {
    search_params.set("limit", String(query.limit));
  }

  const query_string = search_params.toString();
  const path = query_string ? `users?${query_string}` : "users";

  return authenticated_api_request<T_Get_Users_Response>(path, {
    method: "GET",
  });
}
