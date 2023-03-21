import dotenv from 'dotenv';
dotenv.config();

const expiration = process.env.JWT_EXPIRATION ?? '';
const expiresIn =
  typeof Number(expiration) === 'number' ? Number(expiration) : expiration;

export const config = {
  jwt: {
    secret: process.env.JWT_SECRET ?? '',
    expiresIn,
  },
};
