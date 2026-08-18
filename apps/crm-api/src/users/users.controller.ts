//src/users/users.controller.ts

import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { Users_Service } from './users.service';
import { Allowed_Roles } from 'src/auth/decorators/allowed_roles.decorator';
import { Current_User } from 'src/auth/decorators/current_user.decorator';
import type { T_Authenticated_User } from 'types/auth/authenticated_request.types';
import { Approve_User_DTO } from './dto/approve_user.dto';
import { Change_User_Role_DTO } from './dto/change_user_role.dto';
import { Get_Users_Query_DTO } from './dto/get_users_query.dto';

@Controller('users')
export class Users_Controller {
  constructor(private readonly users_service: Users_Service) {}

  @Allowed_Roles(['OWNER'])
  @Get()
  find_all(
    @Current_User()
    user: T_Authenticated_User,
    @Query()
    query: Get_Users_Query_DTO,
  ) {
    return this.users_service.find_all(user.organization_id, query);
  }

  @Allowed_Roles(['OWNER'])
  @Get('pending')
  find_pending(
    @Current_User()
    user: T_Authenticated_User,
  ) {
    return this.users_service.find_pending(user.organization_id);
  }

  @Allowed_Roles(['OWNER'])
  @Patch(':user_id/approve')
  approve_pending(
    @Current_User()
    user: T_Authenticated_User,
    @Param('user_id', new ParseUUIDPipe({ version: '7' }))
    user_id: string,
    @Body() dto: Approve_User_DTO,
  ) {
    return this.users_service.approve_pending(
      user.organization_id,
      user_id,
      dto.role,
    );
  }

  @Allowed_Roles(['OWNER'])
  @Patch(':user_id/reject')
  reject_pending(
    @Current_User()
    user: T_Authenticated_User,
    @Param('user_id', new ParseUUIDPipe({ version: '7' }))
    user_id: string,
  ) {
    return this.users_service.reject_pending(user.organization_id, user_id);
  }

  @Allowed_Roles(['OWNER'])
  @Patch(':user_id/role')
  change_role(
    @Current_User()
    user: T_Authenticated_User,
    @Param('user_id', new ParseUUIDPipe({ version: '7' }))
    user_id: string,
    @Body()
    dto: Change_User_Role_DTO,
  ) {
    return this.users_service.change_role(
      user.organization_id,
      user_id,
      dto.role,
    );
  }
}
