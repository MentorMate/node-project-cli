const request = require('supertest');
const { create: createApp } = require('../src/app');

describe('GET /hello-world', () => {
  let app;

  beforeAll(() => {
    app = createApp().app;
  });

  it('should return "Hello, World!"', async () => {
    await request(app).get('/').expect(200).expect('Hello, World!');
  });
});
