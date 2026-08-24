import { T_Active_User_Role } from "@/modules/auth/types/login.types";

export type T_User_Role = T_Active_User_Role;

export type T_User_Status = | 'PENDING' | 'ACTIVE' | 'DEACTIVATED' | 'REJECTED' | 'TEMPORARILY_BLOCKED'

export type T_User = {
  id: string;
  email: string;
  f_name: string;
  l_name: string;
  role: T_User_Role;
  status: T_User_Status;
  email_verified_at: string | null;
  approved_at: string | null;
  deactivated_at: string | null;
  created_at: string;
  updated_at: string;
}

export type T_Users_Pagination = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export type T_Get_Users_Query = {
  status?: T_User_Status;
  role?: T_User_Role;
  page?: number;
  limit?: number;
}

export type T_Get_Users_Response = {
  users: T_User[];
  pagination: T_Users_Pagination;

}