export type T_Login_Request = {
  email: string;
  password: string;
};

export type T_Active_User_Role =
  "OWNER" | "ADMINISTRATOR" | "MANAGER" | "EMPLOYEE" | "READ_ONLY";

export type T_Login_User = {
  id: string;
  email: string;
  f_name: string;
  l_name: string;
  role: T_Active_User_Role;
  status: "ACTIVE";
};

export type T_Login_Response = {
  user: T_Login_User;
  access_token: string;
};

export type T_Refresh_Response = {
  access_token: string;
};