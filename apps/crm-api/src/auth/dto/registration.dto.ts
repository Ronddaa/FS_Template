//src/auth/dto/registration.dto.ts

import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class Registration_DTO {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  f_name!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  l_name!: string;

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password!: string;
}
