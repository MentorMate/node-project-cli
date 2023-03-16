import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

interface HashPasswordFunction {
  (saltRounds: number, password: string): Promise<string>;
}

interface CompareHashFunction {
  (password: string, hashedPassword: string): Promise<boolean>;
}

interface SignTokenFunction {
  (email: string): string;
}

const hashPassword: HashPasswordFunction = async function hashPassword(
  saltRounds: number,
  password: string
): Promise<string> {
  return bcrypt.hash(password, saltRounds);
};

const compareHash: CompareHashFunction = async function compareHash(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
};

const signToken: SignTokenFunction = function signToken(email: string) {
  const secret: string | undefined = process.env.JWT_SECRET ?? '';
  return jwt.sign({ email }, secret, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
};

export interface UserModuleHelpersFunctions
  extends Record<string, CallableFunction> {
  hashPassword: HashPasswordFunction;
  compareHash: CompareHashFunction;
  signToken: SignTokenFunction;
}

export { hashPassword, compareHash, signToken };
