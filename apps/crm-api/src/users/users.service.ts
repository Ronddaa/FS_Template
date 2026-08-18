//src/users/users.service.ts

import { User_Role } from '@crm/database';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Database_Service } from 'src/database/database.service';
import { ASSIGNABLE_USER_ROLES } from './constants/assignable_user_roles.constants';
import { Get_Users_Query_DTO } from './dto/get_users_query.dto';

@Injectable()
export class Users_Service {
  constructor(private readonly db_service: Database_Service) {}

  find_pending(organization_id: string) {
    return this.db_service.user.findMany({
      where: {
        organization_id,
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
      orderBy: [
        {
          created_at: 'asc',
        },
        {
          id: 'asc',
        },
      ],
    });
  }

  async approve_pending(
    organization_id: string,
    user_id: string,
    role: User_Role,
  ) {
    const role_is_assignable = ASSIGNABLE_USER_ROLES.some(
      (assignable_role) => assignable_role === role,
    );

    if (!role_is_assignable) {
      throw new BadRequestException('This role cannot be assigned');
    }

    const approved_at = new Date();

    const result = await this.db_service.user.updateMany({
      where: {
        id: user_id,
        organization_id,
        status: 'PENDING',
      },
      data: {
        role,
        status: 'ACTIVE',
        approved_at,
      },
    });

    if (result.count !== 1) {
      throw new NotFoundException('Pending user not found');
    }

    return {
      user: {
        id: user_id,
        role,
        status: 'ACTIVE' as const,
        approved_at,
      },
    };
  }

  async reject_pending(organization_id: string, user_id: string) {
    const result = await this.db_service.user.updateMany({
      where: {
        id: user_id,
        organization_id,
        status: 'PENDING',
      },
      data: {
        status: 'REJECTED',
      },
    });

    if (result.count !== 1) {
      throw new NotFoundException('Pending user not found');
    }

    return {
      user: {
        id: user_id,
        status: 'REJECTED' as const,
      },
    };
  }

  async change_role(organization_id: string, user_id: string, role: User_Role) {
    const role_is_assignable = ASSIGNABLE_USER_ROLES.some(
      (assignable_role) => assignable_role === role,
    );

    if (!role_is_assignable) {
      throw new BadRequestException('This role cannot be assinged');
    }

    const result = await this.db_service.user.updateMany({
      where: {
        id: user_id,
        organization_id,
        status: 'ACTIVE',
        role: {
          not: 'OWNER',
        },
      },
      data: {
        role,
      },
    });

    if (result.count !== 1) {
      throw new NotFoundException('Active non-owner user not found');
    }

    return {
      user: {
        id: user_id,
        role,
        status: 'ACTIVE' as const,
      },
    };
  }

  async find_all(organization_id: string, query: Get_Users_Query_DTO) {
    const { status, role, page, limit } = query;

    const where = {
      organization_id,
      ...(status ? { status } : {}),
      ...(role ? { role } : {}),
    };

    const [users, total] = await Promise.all([
      this.db_service.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          f_name: true,
          l_name: true,
          role: true,
          status: true,
          email_verified_at: true,
          approved_at: true,
          deactivated_at: true,
          created_at: true,
          updated_at: true,
        },
        orderBy: [
          {
            created_at: 'asc',
          },
          {
            id: 'desc',
          },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.db_service.user.count({
        where,
      }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }
}
