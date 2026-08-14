//src/auth/services/password.service.ts

import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

const ARGON2_MEMORY_COST = 65_536;
const ARGON2_TIME_COST = 3;
const ARGON2_PARALLELISM = 1;
const ARGON2_HASH_LENGTH = 32;

@Injectable()
export class Password_Service {
  hash_pass(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: ARGON2_MEMORY_COST,
      timeCost: ARGON2_TIME_COST,
      parallelism: ARGON2_PARALLELISM,
      hashLength: ARGON2_HASH_LENGTH,
    });
  }

  verify_pass(pass_hash: string, pass: string): Promise<boolean> {
    return argon2.verify(pass_hash, pass);
  }
}
