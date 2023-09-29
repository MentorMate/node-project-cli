import request from 'supertest';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { getUserCredentials } from '../utils/get-user-credentials';
import { registerUser } from '../utils/register-user';
import { expectError } from '../utils/expect-error';
import { InvalidCredentials, UnprocessableEntity } from '../utils/errors';

describe('POST /auth/login', () => {
  const credentials = getUserCredentials();

  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    await registerUser(app, credentials);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('given the email and password are valid', () => {
    it('should login the user and return a jwt token', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send(credentials)
        .expect(200);
      expect(typeof res.body.idToken).toBe('string');
    });

    describe('when there are empty credentials', () => {
      it('should return 422', async () => {
        await request(app)
          .post('/auth/login')
          .send({})
          .expect('content-type', /json/)
          .expect(expectError(UnprocessableEntity));
      });
    });

    describe('when the email does not exist in db', () => {
      it('should return 422', async () => {
        const newCredentials = getUserCredentials();
        await request(app)
          .post('/auth/login')
          .send(newCredentials)
          .expect('content-type', /json/)
          .expect(expectError(InvalidCredentials));
      });
    });
  });

  describe('when the password does not match in db', () => {
    it('should return 422', async () => {
      await request(app)
        .post('/auth/login')
        .send({ email: credentials.email, password: 'wrong password' })
        .expect('content-type', /json/)
        .expect(expectError(InvalidCredentials));
    });
  });
});
