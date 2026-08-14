//src/auth/auth.service.ts

import {
  ConflictException,
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { Database_Service } from 'src/database/database.service';
import { Password_Service } from './services/password.service';
import { Registration_DTO } from './dto/registration.dto';
import { Prisma } from '@crm/database';
import { Session_Service } from './services/session.service';
import { Login_DTO } from './dto/login.dto';
import { T_Login_Context } from 'types/auth/login.types';

@Injectable()
export class Auth_Service {
  constructor(
    private readonly db_service: Database_Service,
    private readonly pass_service: Password_Service,
    private readonly session_service: Session_Service,
  ) {}

  async register(dto: Registration_DTO) {
    const organization_id = await this.get_organization_id();

    const email = dto.email.trim().toLowerCase();
    const f_name = dto.f_name.trim();
    const l_name = dto.l_name.trim();

    const existing_user = await this.db_service.user.findUnique({
      where: {
        organization_id_email: {
          organization_id,
          email,
        },
      },
      select: {
        id: true,
      },
    });

    if (existing_user) {
      throw new ConflictException('An account with this email already exists');
    }

    const pass_hash = await this.pass_service.hash_pass(dto.password);

    try {
      const user = await this.db_service.user.create({
        data: {
          organization_id,
          email,
          pass_hash,
          f_name,
          l_name,
          role: 'EMPLOYEE',
          status: 'PENDING',
        },
        select: {
          id: true,
          email: true,
          f_name: true,
          l_name: true,
          role: true,
          status: true,
          created_at: true,
        },
      });

      return {
        message: 'Registration request submitted',
        user,
      };
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'An account with this email already exists',
        );
      }

      throw error;
    }
  }

  async login(dto: Login_DTO, context: T_Login_Context) {
    const organization_id = await this.get_organization_id();

    const email = dto.email.trim().toLowerCase();

    const user = await this.db_service.user.findUnique({
      where: {
        organization_id_email: {
          organization_id,
          email,
        },
      },
      select: {
        id: true,
        organization_id: true,
        email: true,
        pass_hash: true,
        f_name: true,
        l_name: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const pass_is_valid = await this.pass_service.verify_pass(
      user.pass_hash,
      dto.password,
    );

    if (!pass_is_valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    switch (user.status) {
      case 'PENDING':
        throw new ForbiddenException({
          code: 'ACCOUNT_PENDING',
          message: 'Your account is awaiting approval',
        });

      case 'REJECTED':
        throw new ForbiddenException({
          code: 'ACCOUNT_REJECTED',
          message: 'Your registration request was rejected',
        });

      case 'DEACTIVATED':
        throw new ForbiddenException({
          code: 'ACCOUNT_DEACTIVATED',
          message: 'Your account is deactivated',
        });

      case 'TEMPORARILY_BLOCKED':
        throw new ForbiddenException({
          code: 'ACCOUNT_TEMPORARILY_BLOCKED',
          message: 'Your account is temporarily blocked',
        });

      case 'ACTIVE':
        break;
    }

    const session = await this.session_service.create_session({
      user_id: user.id,
      organization_id: user.organization_id,
      role: user.role,
      user_agent: context.user_agent,
      ip_address: context.ip_address,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        f_name: user.f_name,
        l_name: user.l_name,
        role: user.role,
        status: user.status,
      },
      ...session,
    };
  }

  refresh(refresh_token: string, context: T_Login_Context) {
    return this.session_service.refresh_session({
      refresh_token,
      user_agent: context.user_agent,
      ip_address: context.ip_address,
    });
  }

  // ======== PRIVATE FUNCITONS ========
  // ======== PRIVATE FUNCITONS ========
  // ======== PRIVATE FUNCITONS ========

  private async get_organization_id(): Promise<string> {
    const organization = await this.db_service.organization.findMany({
      select: {
        id: true,
      },
      take: 2,
    });

    if (organization.length === 0) {
      throw new ServiceUnavailableException(
        'CRM organization is not configurate',
      );
    }

    if (organization.length > 1) {
      throw new ServiceUnavailableException(
        'CRM contains more than one organization',
      );
    }

    return organization[0].id;
  }

  logout(refresh_token: string): Promise<void> {
    return this.session_service.revoke_session(refresh_token, 'LOGOUT');
  }
}
