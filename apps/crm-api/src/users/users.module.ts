//src/users/users.module.ts

import { Module } from '@nestjs/common';
import { Users_Controller } from './users.controller';
import { Users_Service } from './users.service';

@Module({
  controllers: [Users_Controller],
  providers: [Users_Service],
})
export class Users_Module {}
