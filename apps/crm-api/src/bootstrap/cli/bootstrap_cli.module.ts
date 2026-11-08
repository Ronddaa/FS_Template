// Path: apps/crm-api/src/bootstrap/cli/bootstrap_cli.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Database_Module } from 'src/database/database.module';
import { Bootstrap_Token_Service } from '../services/bootstrap_token.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    Database_Module,
  ],
  providers: [Bootstrap_Token_Service],
})
export class Bootstrap_CLI_Module {}
