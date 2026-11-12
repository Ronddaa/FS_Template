// Path: apps/crm-api/src/auth/dto/verify_passkey_login.dto.ts

import type { AuthenticationResponseJSON } from '@simplewebauthn/server';
import { IsObject, IsUUID } from 'class-validator';

export class Verify_Passkey_Login_DTO {
  @IsUUID()
  challenge_id!: string;

  @IsObject()
  credential!: AuthenticationResponseJSON;
}
