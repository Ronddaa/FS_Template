//src/auth/dto/login.dto.ts

import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class Login_DTO {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(254)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password!: string;
}
