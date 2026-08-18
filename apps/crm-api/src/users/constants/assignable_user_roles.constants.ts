import { User_Role } from '@crm/database';

export const ASSIGNABLE_USER_ROLES = [
  'ADMINISTRATOR',
  'MANAGER',
  'EMPLOYEE',
  'READ_ONLY',
] as const satisfies readonly User_Role[];

export type T_Assignable_User_Role = (typeof ASSIGNABLE_USER_ROLES)[number];
