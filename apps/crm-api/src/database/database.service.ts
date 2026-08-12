//src/database/database.service.ts

import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { Database_Client } from '@crm/database';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class Database_Service
  extends Database_Client
  implements OnModuleInit, OnApplicationShutdown
{
  constructor(config_service: ConfigService) {
    const database_url = config_service.get<string>('DATABASE_URL');

    if (!database_url) {
      throw new Error('DATABASE_URL is not defined');
    }

    super(database_url);
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onApplicationShutdown(): Promise<void> {
    await this.$disconnect();
  }
}
