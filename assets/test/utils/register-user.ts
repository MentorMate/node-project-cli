import request from 'supertest';
import { getUserCredentials } from './get-user-credentials';

export const registerUser = async (
  app: Express.Application,
  payload = getUserCredentials()
) => {
  const res = await request(app).post('/auth/register').send(payload);
  if (res.body) {
    return res.body;
  }
};
