//src/health/health.module.ts

import { Module } from '@nestjs/common';
import { Health_Controller } from './health.controller';

@Module({
  controllers: [Health_Controller],
})
export class Health_Module {}
