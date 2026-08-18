export type T_Authenticated_Api_Request = <Response_Type>(
  path: string,
  options?: RequestInit,
) => Promise<Response_Type>;
