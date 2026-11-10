// Path: apps/crm-api/src/bootstrap/dto/start_setup.dto.ts

import { Transform } from 'class-transformer';
import { IsDefined, IsEmail, IsString, Length, Matches, MaxLength } from 'class-validator';

export class Start_Setup_DTO {
  @IsString()
  @Length(43, 43)
  @Matches(/^[A-Za-z0-9_-]+$/)
  token!: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Length(1, 150)
  organization_name!: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Length(2, 100)
  f_name!: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Length(2, 100)
  l_name!: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsDefined()
  @IsString()
  @Matches(/^\+[1-9][0-9]{1,14}$/, {
    message: 'Phone must include the country code, for example +380501234567',
  })
  phone!: string;

  @IsString()
  @Length(8, 128)
  @Matches(/\p{Ll}/u, { message: 'Password must contain a lowercase letter' })
  @Matches(/\p{Lu}/u, { message: 'Password must contain an uppercase letter' })
  @Matches(/[0-9]/, { message: 'Password must contain a digit' })
  @Matches(/[\p{P}\p{S}]/u, {
    message: 'Password must contain a special character',
  })
  password!: string;
}
