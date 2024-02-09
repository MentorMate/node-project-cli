import { hash, compare, genSalt } from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PasswordService {
  async hash(password: string): Promise<string> {
    return hash(password, await genSalt());
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return compare(password, hash);
  }
}
