import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { getUserCredentials } from '../utils/get-user-credentials';
import { registerUser } from '../utils/register-user';
import { expectError } from '../utils/expect-error';
import { UnprocessableEntity, UserConflict } from '../utils/errors';

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
    it('should create a new user and return a jwt token', async () => {
      await app
        .inject({
          method: 'POST',
          url: '/auth/register',
          payload: getUserCredentials(),
        })
        .then((res) => {
          expect(res.statusCode).toBe(200);
          expect(typeof JSON.parse(res.body).idToken).toBe('string');
        });
    });

    describe('when there is an existing user', () => {
      it('should return 409 error', async () => {
        const credentials = getUserCredentials();

        await registerUser(app, credentials);

        await app
          .inject({
            method: 'POST',
            url: '/auth/register',
            payload: credentials,
          })
          .then(expectError(UserConflict));
      });
    });
  });

  describe('when there is invalid payload', () => {
    it('should return 422 error', async () => {
      await app
        .inject({
          method: 'POST',
          url: '/auth/register',
          payload: {
            email: 'test',
            password: 'test',
          },
        })
        .then(expectError(UnprocessableEntity));
    });
  });
});
