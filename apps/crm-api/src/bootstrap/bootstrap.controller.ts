// Path: apps/crm-api/src/bootstrap/bootstrap.controller.ts

import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Bootstrap_Registration_Service } from './services/bootstrap_registration.service';
import { Start_Setup_DTO } from './dto/start_setup.dto';
import { Confirm_Email_DTO } from './dto/confirm_email.dto';

@Controller('bootstrap')
export class Bootstrap_Controller {
  constructor(
    private readonly registration_service: Bootstrap_Registration_Service,
  ) {}

  @Post('start')
  @HttpCode(HttpStatus.NO_CONTENT)
  async start_registration(@Body() dto: Start_Setup_DTO): Promise<void> {
    await this.registration_service.start_registration(dto);
  }

  @Post('confirm-email')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirm_email(@Body() dto: Confirm_Email_DTO): Promise<void> {
    await this.registration_service.confirm_email(dto.token);
  }
}
