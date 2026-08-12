//src/health/health.controller.ts

import { Controller, Get } from '@nestjs/common';
import { Database_Service } from 'src/database/database.service';

@Controller('health')
export class Health_Controller {
  constructor(private readonly database_service: Database_Service) {}

  @Get()
  async check(): Promise<{ status: 'ok'; database: 'connected' }> {
    await this.database_service.$queryRaw`SELECT 1`;

    return {
      status: 'ok',
      database: 'connected',
    };
  }
}
