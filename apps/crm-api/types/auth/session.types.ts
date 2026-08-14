import type { User_Role } from '@crm/database';

export type T_Create_Session_Input = {
  user_id: string;
  organization_id: string;
  role: User_Role;
  user_agent?: string;
  ip_address?: string;
};

export type T_Created_Session = {
  access_token: string;
  refresh_token: string;
  refresh_token_expires_at: Date;
};

export type T_Refresh_Session_Input = {
  refresh_token: string;
  user_agent?: string;
  ip_address?: string;
};
