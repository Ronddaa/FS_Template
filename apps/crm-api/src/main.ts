import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

function getArg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);

  if (index === -1) {
    return undefined;
  }

  return process.argv[index + 1];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const frontend_url =
    getArg('frontend_url') ??
    process.env.FRONTEND_URL ??
    'http://localhost:3000';

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: frontend_url,
    credentials: true,
  });

  const port = Number(getArg('port') ?? process.env.PORT ?? 4200);
  const host = getArg('host') ?? process.env.HOST ?? '127.0.0.1';

  await app.listen(port, host);

  console.log(`Server running on http://${host}:${port}/api`);
}
void bootstrap().catch((error: unknown) => {
  console.error('Failed to start CRM API:', error);
  process.exitCode = 1;
});
