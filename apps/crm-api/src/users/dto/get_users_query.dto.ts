import { User_Role, User_Status } from '@crm/database';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export class Get_Users_Query_DTO {
  @IsOptional()
  @IsEnum(User_Status)
  status?: User_Status;

  @IsOptional()
  @IsEnum(User_Role)
  role?: User_Role;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
