import '@extensions/zod/register';
import '@extensions/knex/register';

import request from 'supertest';
import { create as createApp } from './utils/app';

describe('GET /hello-world', () => {
  let app: Express.Application;
  let destroy: () => Promise<void>;

  beforeAll(() => {
    const { app: _app, destroy: _destroy } = createApp();
    app = _app;
    destroy = _destroy;
  });

  afterAll(async () => {
    await destroy()
  });

  it('should ', async () => {
    await request(app).get('/').expect(200, 'Hello, World!');
  });
});
