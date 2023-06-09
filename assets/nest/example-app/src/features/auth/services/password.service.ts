import { hash, compare, genSalt } from 'bcrypt';
import { PasswordServiceInterface } from '../interfaces';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PasswordService implements PasswordServiceInterface {
  async hash(password: string): Promise<string> {
    return hash(password, await genSalt());
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return compare(password, hash);
  }
}
