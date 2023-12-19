import { expressjwt } from 'express-jwt';

export const validateJwt = (secret: string) =>
  expressjwt({
    secret,
    getToken: (req) => {
      if (typeof req.headers.authorization !== 'string') {
        return '';
      }

      const [type, token] = req.headers.authorization.split(' ');
      if (type !== 'Bearer') {
        return '';
      }

      return token;
    },
    algorithms: ['HS256'],
  });
