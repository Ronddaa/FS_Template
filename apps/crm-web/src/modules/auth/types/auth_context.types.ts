import { T_Authenticated_Api_Request } from "@/lib/api/authenticated_api_request.types";
import { T_Login_Response, T_Login_User } from "./login.types";

export type T_Auth_Status = "CHECKING" | "ANONYMOUS" | "AUTHENTICATED";

export type T_Auth_Context = {
    user: T_Login_User | null;
    auth_status: T_Auth_Status;
    get_access_token: () => string | null;
    set_access_token: (access_token: string) => void;
    set_auth_session: (login_data: T_Login_Response) => void;
    clear_auth_session: () => void;
    logout_session: () => Promise<void>;
    authenticated_api_request: T_Authenticated_Api_Request;
}