import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Claims, JwtConfig } from '@modules';

const compareHash = async function compareHash(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
};

const hashPassword = async function hashPassword(
  password: string
): Promise<string> {
  const saltRounds = await genSalt();
  return bcrypt.hash(password, saltRounds);
};

const genSalt = async function genSalt(rounds?: number): Promise<string> {
  return bcrypt.genSalt(rounds);
};

const signToken = function signToken(claims: Claims, config: JwtConfig) {
  return jwt.sign(claims, config.secret, {
    // algorithm (default: HS256)
    expiresIn: config.expiresIn,
  });
};

const getUserClaim = function (claims: Claims) {
  return {
    ...claims,
  };
};

export { hashPassword, compareHash, signToken, getUserClaim };
