import bcrypt from 'bcrypt';

export class PasswordService {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, await bcrypt.genSalt());
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
