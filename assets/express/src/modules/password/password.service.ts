import bcrypt from 'bcrypt';
import { PasswordService } from './interfaces';

export const createPasswordService = (): PasswordService => {
  const genSalt = async function genSalt(rounds?: number): Promise<string> {
    return bcrypt.genSalt(rounds);
  };

  return {
    compareHash: async (
      password: string,
      hashedPassword: string
    ): Promise<boolean> => {
      return bcrypt.compare(password, hashedPassword);
    },

    hashPassword: async (password: string): Promise<string> => {
      const saltRounds = await genSalt();
      return bcrypt.hash(password, saltRounds);
    },
  };
};
