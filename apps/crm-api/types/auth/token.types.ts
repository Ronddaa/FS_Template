import type { User_Role } from '@crm/database';

export type T_Access_Token_Payload = {
  sub: string;
  organization_id: string;
  session_id: string;
  role: User_Role;
};

export type T_Refresh_Token_Data = {
  refresh_token: string;
  refresh_token_hash: string;
};
