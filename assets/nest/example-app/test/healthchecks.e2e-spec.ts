import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { HealthchecksModule } from '@api/healthchecks/healthchecks.module';

describe('GET /healthz', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [HealthchecksModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  it('/live', async () => {
    await app
      .inject({
        method: 'GET',
        url: '/healthz/live',
      })
      .then(({ statusCode, body }) => {
        expect(statusCode).toBe(200);
        expect(body).toBe('OK');
      });
  });

  it('/ready', async () => {
    await app
      .inject({
        method: 'GET',
        url: '/healthz/ready',
      })
      .then(({ statusCode, body }) => {
        expect(statusCode).toBe(200);
        expect(body).toBe('OK');
      });
  });
});
