import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

interface HashPasswordFunction {
  (saltRounds: string | number, password: string): Promise<string>;
}

interface CompareHashFunction {
  (password: string, hashedPassword: string): Promise<boolean>;
}

interface SignTokenFunction {
  (email: string): string;
}

interface GenSaltFunction {
  (rounds?: number): string;
}

const DEFAULT_EXPIRATION = 1000000;

const compareHash: CompareHashFunction = async function compareHash(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
};

const hashPassword: HashPasswordFunction = async function hashPassword(
  saltRounds: string | number,
  password: string
): Promise<string> {
  return bcrypt.hash(password, saltRounds);
};

const genSalt: GenSaltFunction = function genSalt(rounds?: number): string {
  return bcrypt.genSaltSync(rounds);
};

const secret: string | undefined = process.env.JWT_SECRET ?? '';
const expiresIn = process.env.JWT_EXPIRATION ?? DEFAULT_EXPIRATION;

const signToken: SignTokenFunction = function signToken(email: string) {
  return jwt.sign({ email }, secret, {
    // algorithm (default: HS256)
    expiresIn,
  });
};

export interface UserModuleHelpersFunctions
  extends Record<string, CallableFunction> {
  hashPassword: HashPasswordFunction;
  compareHash: CompareHashFunction;
  signToken: SignTokenFunction;
  genSalt: GenSaltFunction;
}

export { hashPassword, compareHash, genSalt, signToken };
