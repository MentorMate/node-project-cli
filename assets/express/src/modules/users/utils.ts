import bcrypt from 'bcrypt';

interface HashPasswordFunction {
  (saltRounds: number, password: string): Promise<string>;
}

interface CompareHashFunction {
  (password: string, hashedPassword: string): Promise<boolean>;
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

export interface UserModuleHelpersFunctions
  extends Record<string, CallableFunction> {
  hashPassword: HashPasswordFunction;
  compareHash: CompareHashFunction;
}

export { hashPassword, compareHash };
