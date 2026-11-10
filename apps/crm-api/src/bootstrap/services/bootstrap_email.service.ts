// Path: apps/crm-api/src/bootstrap/services/bootstrap_email.service.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';
import { build_email_confirmation_url } from '../utils/build_email_confirmation_url.utils';

@Injectable()
export class Bootstrap_Email_Service {
  private readonly transporter: Transporter;
  private readonly mail_from: string;
  private readonly web_origin: URL;

  constructor(config_service: ConfigService) {
    this.transporter = createTransport(
      config_service.getOrThrow<string>('SMTP_URL'),
    );
    this.mail_from = config_service.getOrThrow<string>('MAIL_FROM');
    this.web_origin = new URL(
      config_service.getOrThrow<string>('CRM_WEB_ORIGIN'),
    );
  }

  async send_confirmation(email: string, email_token: string): Promise<void> {
    const confirmation_url = build_email_confirmation_url(
      this.web_origin,
      email_token,
    );

    await this.transporter.sendMail({
      from: this.mail_from,
      to: email,
      subject: 'Confirm your email to set up your CRM',
      text: [
        'You started setting up a CRM owner account with this email address.',
        'Open the link below and select “Confirm email” to continue.',
        '',
        confirmation_url,
        '',
        'If you did not start this setup, you can ignore this email.',
      ].join('\n'),
    });
  }
}
