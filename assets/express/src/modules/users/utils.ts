import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { CreateUser, CreateUserInput } from '@modules';

interface HashPasswordFunction {
  (saltRounds: number, password: string): Promise<string>;
}

interface CompareHashFunction {
  (password: string, hashedPassword: string): Promise<boolean>;
}

interface SignTokenFunction {
  (email: string): string;
}

interface MapCreateUserFunction {
  (user: CreateUserInput, idToken: string): CreateUser;
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

const mapCreateUser: MapCreateUserFunction = (
  user: CreateUserInput,
  idToken: string
) => ({
  user: {
    email: user.email,
    role: user.role,
  },
  idToken,
});

export interface UserModuleHelpersFunctions
  extends Record<string, CallableFunction> {
  hashPassword: HashPasswordFunction;
  compareHash: CompareHashFunction;
  signToken: SignTokenFunction;
  mapCreateUser: MapCreateUserFunction;
}

export { hashPassword, compareHash, signToken, mapCreateUser };
