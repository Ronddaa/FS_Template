//src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import {
  ACCESS_TOKEN_AUDIENCE,
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_ISSUER,
} from './constants/auth.constants';
import { Password_Service } from './services/password.service';
import { Auth_Controller } from './auth.controller';
import { Auth_Service } from './auth.service';
import { Token_Service } from './services/token.service';
import { Session_Service } from './services/session.service';
import { APP_GUARD } from '@nestjs/core';
import { Access_Token_Guard } from './guards/access_token.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (config_service: ConfigService) => ({
        secret: config_service.getOrThrow<string>('AUTH_ACCESS_TOKEN_SECRET'),

        signOptions: {
          algorithm: 'HS256',
          expiresIn: ACCESS_TOKEN_EXPIRES_IN,
          issuer: ACCESS_TOKEN_ISSUER,
          audience: ACCESS_TOKEN_AUDIENCE,
        },
      }),
    }),
  ],
  controllers: [Auth_Controller],
  providers: [
    Auth_Service,
    Password_Service,
    Session_Service,
    Token_Service,
    {
      provide: APP_GUARD,
      useClass: Access_Token_Guard,
    },
  ],
  exports: [JwtModule, Password_Service],
})
export class Auth_Module {}
