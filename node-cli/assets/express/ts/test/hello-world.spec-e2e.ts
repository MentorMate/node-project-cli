import { Application } from 'express';
import request from 'supertest';
import { create as createApp } from '../src/app';

describe('GET /hello-world', () => {
  let app: Application;

  beforeAll(() => {
    app = createApp().app;
  });

  it('should return "Hello, World!"', async () => {
    await request(app).get('/').expect(200).expect('Hello, World!');
  });
});
