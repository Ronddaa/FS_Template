// Path: apps/crm-api/src/bootstrap/cli/issue_setup_token.ts

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Bootstrap_CLI_Module } from './bootstrap_cli.module';
import { Bootstrap_Token_Service } from '../services/bootstrap_token.service';
import { ConflictException } from '@nestjs/common';

function get_setup_url(config_service: ConfigService): URL {
  const web_origin = config_service.get<string>('CRM_WEB_ORIGIN')?.trim();

  if (!web_origin || !URL.canParse(web_origin)) {
    throw new Error('CRM_WEB_ORIGIN must be a valid absolute URL');
  }

  const url = new URL(web_origin);
  const is_local_http =
    url.protocol === 'http:' &&
    ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);

  if (url.protocol !== 'https:' && !is_local_http) {
    throw new Error('CRM_WEB_ORIGIN requires HTTPS outside localhost');
  }

  if (url.username || url.password || url.href !== `${url.origin}/`) {
    throw new Error('CRM_WEB_ORIGIN must contain only the frontend origin');
  }

  return new URL('/setup', url.origin);
}

async function issue_setup_token(): Promise<void> {
  const app_context = await NestFactory.createApplicationContext(
    Bootstrap_CLI_Module,
    { logger: false, abortOnError: false },
  );

  try {
    const setup_url = get_setup_url(app_context.get(ConfigService));
    const token_service = app_context.get(Bootstrap_Token_Service);

    setup_url.hash = `token=${await token_service.issue_token()}`;
    process.stdout.write(`${setup_url.href}\n`);
  } finally {
    await app_context.close();
  }
}

void issue_setup_token().catch((error: unknown) => {
  let message = 'Bootstrap failed. Check database connectivity and mirgations.';

  if (
    error instanceof ConflictException ||
    (error instanceof Error && error.message.startsWith('CRM_WEB_ORIGIN'))
  ) {
    message = error.message;
  }
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
