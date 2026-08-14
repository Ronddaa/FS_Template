import { User_Role, User_Status } from '@crm/database';
import { Request } from 'express';

export type T_Authenticated_User = {
  id: string;
  organization_id: string;
  email: string;
  f_name: string;
  l_name: string;
  role: User_Role;
  status: User_Status;
  session_id: string;
};

export type T_Authenticated_Request = Request & {
  auth_user?: T_Authenticated_User;
};
