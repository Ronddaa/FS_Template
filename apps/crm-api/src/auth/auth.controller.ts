//src/auth/auth.controller.ts

import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Auth_Service } from './auth.service';
import { seconds, Throttle } from '@nestjs/throttler';
import { Registration_DTO } from './dto/registration.dto';
import { Login_DTO } from './dto/login.dto';
import type { Request, Response } from 'express';
import { Public_Route } from './decorators/public_route.decorator';
import { Current_User } from './decorators/current_user.decorator';
import type { T_Authenticated_User } from 'types/auth/authenticated_request.types';

@Controller('auth')
export class Auth_Controller {
  constructor(private readonly auth_service: Auth_Service) {}

  @Throttle({
    default: {
      limit: 5,
      ttl: seconds(60),
    },
  })
  @Public_Route()
  @Post('register')
  register(@Body() dto: Registration_DTO) {
    return this.auth_service.register(dto);
  }

  @Throttle({
    default: {
      limit: 5,
      ttl: seconds(60),
    },
  })
  @Public_Route()
  @Post('login')
  async login(
    @Body() dto: Login_DTO,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.auth_service.login(dto, {
      user_agent: request.get('user-agent')?.slice(0, 512),
      ip_address: request.ip,
    });

    this.set_refresh_cookie(
      response,
      result.refresh_token,
      result.refresh_token_expires_at,
    );

    response.setHeader('Cache-Control', 'no-store');

    return {
      user: result.user,
      access_token: result.access_token,
    };
  }

  @Throttle({
    default: {
      limit: 5,
      ttl: seconds(60),
    },
  })
  @Public_Route()
  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refresh_token = this.get_refresh_token(request);

    const result = await this.auth_service.refresh(refresh_token, {
      user_agent: request.get('user-agent')?.slice(0, 512),
      ip_address: request.ip,
    });

    this.set_refresh_cookie(
      response,
      result.refresh_token,
      result.refresh_token_expires_at,
    );

    response.setHeader('Cache-Control', 'no-store');

    return {
      access_token: result.access_token,
    };
  }

  @Throttle({
    default: {
      limit: 20,
      ttl: seconds(60),
    },
  })
  @Public_Route()
  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refresh_token = this.get_optional_refresh_token(request);

    if (refresh_token) {
      await this.auth_service.logout(refresh_token);
    }

    this.clean_refreash_cookie(response);

    response.setHeader('Cache-Control', 'no-store');

    return { message: 'Logout out successfully' };
  }

  @Get('me')
  get_me(@Current_User() user: T_Authenticated_User) {
    return {
      user,
    };
  }

  // ======== PRIVATE FUNCITONS ========
  // ======== PRIVATE FUNCITONS ========
  // ======== PRIVATE FUNCITONS ========

  private get_optional_refresh_token(request: Request): string | undefined {
    const cookies: unknown = request.cookies;

    if (typeof cookies !== 'object' || cookies === null) {
      return undefined;
    }

    const refresh_token = (cookies as Record<string, unknown>).refresh_token;

    if (typeof refresh_token !== 'string' || refresh_token.length === 0) {
      return undefined;
    }

    return refresh_token;
  }

  private get_refresh_token(request: Request): string {
    const refresh_token = this.get_optional_refresh_token(request);

    if (!refresh_token) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    return refresh_token;
  }

  private set_refresh_cookie(
    response: Response,
    refresh_token: string,
    expires_at: Date,
  ): void {
    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth',
      expires: expires_at,
    });
  }

  private clean_refreash_cookie(response: Response): void {
    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth',
    });
  }
}
