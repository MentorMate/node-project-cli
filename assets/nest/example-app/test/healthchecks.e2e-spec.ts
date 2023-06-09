import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { HealthchecksModule } from '../src/features/healthchecks/healthchecks.module';

describe('HelloWorldController (e2e)', () => {
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

  it('/healthz/live (GET)', () => {
    return request(app.getHttpServer())
      .get('/healthz/live')
      .expect(200)
      .expect('OK');
  });

  it('/healthz/ready (GET)', () => {
    return request(app.getHttpServer())
      .get('/healthz/ready')
      .expect(200)
      .expect('OK');
  });
});
