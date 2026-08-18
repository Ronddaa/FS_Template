import { IsIn } from 'class-validator';
import {
  ASSIGNABLE_USER_ROLES,
  type T_Assignable_User_Role,
} from '../constants/assignable_user_roles.constants';

export class Change_User_Role_DTO {
  @IsIn(ASSIGNABLE_USER_ROLES, {
    message: 'role must be one of: ADMINISTRATOR, MANAGER, EMPLOYEE, READ_ONLY',
  })
  role!: T_Assignable_User_Role;
}
