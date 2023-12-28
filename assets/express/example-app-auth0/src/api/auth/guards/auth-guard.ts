import { auth } from 'express-oauth2-jwt-bearer';

export const authGuard = (audience: string, issuerBaseURL: string) =>
  auth({
    audience: [audience],
    issuerBaseURL,
  });
