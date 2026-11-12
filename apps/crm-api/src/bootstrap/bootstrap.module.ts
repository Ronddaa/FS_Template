// Path: apps/crm-api/src/bootstrap/bootstrap.module.ts

import { Module } from '@nestjs/common';
import { Auth_Module } from 'src/auth/auth.module';
import { Bootstrap_Token_Service } from './services/bootstrap_token.service';
import { Bootstrap_Email_Service } from './services/bootstrap_email.service';
import { Bootstrap_Email_Token_Service } from './services/bootstrap_email_token.service';
import { Bootstrap_Registration_Service } from './services/bootstrap_registration.service';
import { Bootstrap_Controller } from './bootstrap.controller';
import { Owner_Passkey_Enrollment_Service } from './services/owner_passkey_enrollment.service';
import { Owner_Passkey_Registration_Service } from './services/owner_passkey_registration.service';

@Module({
  imports: [Auth_Module],
  providers: [
    Bootstrap_Token_Service,
    Bootstrap_Email_Service,
    Bootstrap_Email_Token_Service,
    Bootstrap_Registration_Service,
    Owner_Passkey_Enrollment_Service,
    Owner_Passkey_Registration_Service,
  ],
  controllers: [Bootstrap_Controller],
})
export class Bootstrap_Module {}
