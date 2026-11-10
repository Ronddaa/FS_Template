// Path: apps/crm-api/src/bootstrap/dto/confirm_email.dto.ts

import { IsString, Length, Matches } from 'class-validator';

export class Confirm_Email_DTO {
  @IsString()
  @Length(43, 43)
  @Matches(/^[A-Za-z0-9_-]+$/, {
    message: 'Invalid email confirmation token.',
  })
  token!: string;
}
