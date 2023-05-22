import { expressjwt } from 'express-jwt';

export const validateJwt = (secret: string) =>
  expressjwt({
    secret,
    algorithms: ['HS256'],
  });
