import { User_Role } from '@crm/database';
import { Reflector } from '@nestjs/core';

export const Allowed_Roles = Reflector.createDecorator<User_Role[]>();
