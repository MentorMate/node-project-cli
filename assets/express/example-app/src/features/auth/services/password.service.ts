import bcrypt from 'bcrypt';
import { PasswordServiceInterface } from '../interfaces';

export class PasswordService implements PasswordServiceInterface {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, await bcrypt.genSalt());
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
