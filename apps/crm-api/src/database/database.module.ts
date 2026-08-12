//src/database/database.module.ts

import { Global, Module } from '@nestjs/common';
import { Database_Service } from './database.service';

@Global()
@Module({
  providers: [Database_Service],
  exports: [Database_Service],
})
export class Database_Module {}
