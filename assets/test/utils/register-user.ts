import request, { Response } from 'supertest';
import { Register } from '@common/data/auth';
import { getUserCredentials } from './get-user-credentials';

export const registerUser: (
  app: Express.Application,
  payload?: Register
) => Promise<Response> = async (app, payload = getUserCredentials()) => {
  return await request(app)
    .post('/auth/register')
    .set('Accept', 'application/json')
    .send(payload);
};
