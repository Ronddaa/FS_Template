// Path: apps/crm-api/src/bootstrap/dto/register_owner_passkey.dto.ts

import type { RegistrationResponseJSON } from '@simplewebauthn/server';
import { IsObject, IsString, Length, Matches } from 'class-validator';

export class Begin_Owner_Passkey_DTO {
  @IsString()
  @Length(43, 43)
  @Matches(/^[A-Za-z0-9_-]+$/)
  enrollment_token!: string;
}

export class Finish_Owner_Passkey_DTO extends Begin_Owner_Passkey_DTO {
  @IsObject()
  credential!: RegistrationResponseJSON;
}
