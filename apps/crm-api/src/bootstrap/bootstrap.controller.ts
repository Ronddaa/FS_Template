// Path: apps/crm-api/src/bootstrap/bootstrap.controller.ts

import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Bootstrap_Registration_Service } from './services/bootstrap_registration.service';
import { Start_Setup_DTO } from './dto/start_setup.dto';
import { Confirm_Email_DTO } from './dto/confirm_email.dto';
import { Public_Route } from 'src/auth/decorators/public_route.decorator';
import { Owner_Passkey_Enrollment_Service } from './services/owner_passkey_enrollment.service';
import { seconds, Throttle } from '@nestjs/throttler';
import { Login_DTO } from 'src/auth/dto/login.dto';
import { Verify_Passkey_Code_DTO } from './dto/verify_passkey_code.dto';

@Controller('bootstrap')
export class Bootstrap_Controller {
  constructor(
    private readonly registration_service: Bootstrap_Registration_Service,
    private readonly enrollment_service: Owner_Passkey_Enrollment_Service,
  ) {}

  @Public_Route()
  @Post('start')
  @HttpCode(HttpStatus.NO_CONTENT)
  async start_registration(@Body() dto: Start_Setup_DTO): Promise<void> {
    await this.registration_service.start_registration(dto);
  }

  @Public_Route()
  @Post('confirm-email')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirm_email(@Body() dto: Confirm_Email_DTO): Promise<void> {
    await this.registration_service.confirm_email(dto.token);
  }

  @Public_Route()
  @Throttle({ default: { limit: 5, ttl: seconds(60) } })
  @Post('passkey/request-code')
  @HttpCode(HttpStatus.OK)
  async request_passkey_code(
    @Body() dto: Login_DTO,
  ): Promise<{ request_id: string }> {
    return this.enrollment_service.request_code(dto.email, dto.password);
  }

  @Public_Route()
  @Throttle({ default: { limit: 10, ttl: seconds(60) } })
  @Post('passkey/verify-code')
  @HttpCode(HttpStatus.OK)
  async verify_passkey_code(
    @Body() dto: Verify_Passkey_Code_DTO,
  ): Promise<{ enrollment_token: string }> {
    return this.enrollment_service.verify_code(dto.request_id, dto.code);
  }
}
