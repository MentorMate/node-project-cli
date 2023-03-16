import { expressjwt as jwt } from 'express-jwt';

const secret = process.env.JWT_SECRET ?? '';
const exceptionPaths: string[] = ['/v1/auth/login', '/v1/users/register'];

export const validateAccessToken = function () {
  return jwt({ secret, algorithms: ['HS256'] }).unless({
    path: exceptionPaths,
  });
};
