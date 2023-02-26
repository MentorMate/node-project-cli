import jwt, { VerifyCallback } from 'jsonwebtoken';
import { RequestHandler } from '@common';

const JWT_SECRET: string = process.env.JWT_SECRET_KEY || 'Jw7_S3Cr37K3y';

export const verifyJWT: RequestHandler = function (req, _res, next) {
  if (!req.headers.authorization) {
    return next(new Error('Missing token header'));
  }
  const token = req.headers.authorization.split(' ')[1];

  const verifyCallback: VerifyCallback = function (err, decoded) {
    console.log({ decoded });
    const { email, role } = decoded as { email: string; role: string };

    if (err || !email || !role) {
      next(new Error('Token not valid'));
    }

    req.decodedUser = { email, role };

    next();
  };

  jwt.verify(token, JWT_SECRET, verifyCallback);
};
