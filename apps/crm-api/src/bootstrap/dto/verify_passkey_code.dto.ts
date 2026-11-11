// Path: apps/crm-api/src/bootstrap/dto/verify_passkey_code.dto.ts

import { IsString, Length, Matches } from 'class-validator';

export class Verify_Passkey_Code_DTO {
  @IsString()
  @Length(43, 43)
  @Matches(/^[A-Za-z0-9_-]+$/)
  request_id!: string;

  @IsString()
  @Length(6, 6)
  @Matches(/^[0-9]{6}$/)
  code!: string;
}
