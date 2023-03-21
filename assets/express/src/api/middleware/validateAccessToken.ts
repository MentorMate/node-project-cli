import { expressjwt as jwt } from 'express-jwt';
import { config } from '@common';

const exceptionPaths: string[] = ['/v1/auth/login', '/v1/auth/register'];

export const validateAccessToken = function () {
  return jwt({ secret: config.jwt.secret, algorithms: ['HS256'] }).unless({
    path: exceptionPaths,
  });
};
