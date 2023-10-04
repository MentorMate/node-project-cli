import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { expectError } from '../utils/expect-error';
import { NestKnexService } from '@database/nest-knex.service';
import {
  BadRequestException,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';
import { PasswordService } from '@api/auth/services';

describe('POST /auth/login', () => {
  const credentials = { email: 'hello@email.com', password: 'pass@ord' };

  let app: NestFastifyApplication;
  let nestKnexService: NestKnexService;

  class PasswordServiceMock {
    compare = jest.fn().mockImplementation((a, b) => a === b);
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PasswordService)
      .useClass(PasswordServiceMock)
      .compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );

    await app.init();
    nestKnexService = app.get(NestKnexService);
  });

  beforeEach(async () => {
    await nestKnexService.connection.migrate.rollback();
    await nestKnexService.connection.migrate.latest();
    await nestKnexService.connection.seed.run();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('given the email and password are valid', () => {
    it('should login the user and return a jwt token', async () => {
      await app
        .inject({
          method: 'POST',
          url: '/auth/login',
          payload: credentials,
        })
        .then((res) => {
          expect(res.statusCode).toBe(201);
          expect(typeof res.json().idToken).toBe('string');
        });
    });

    describe('when there are empty credentials', () => {
      it('should return 400', async () => {
        await app
          .inject({
            method: 'POST',
            url: '/auth/login',
          })
          .then((res) => {
            expect(expectError(new BadRequestException(), res.json));
          });
      });
    });

    describe('when the email does not exist in db', () => {
      it('should return 422', async () => {
        const newCredentials = {
          email: 'unregistered@user.com',
          password: credentials.password,
        };

        await app
          .inject({
            method: 'POST',
            url: '/auth/login',
            payload: newCredentials,
          })
          .then((res) => {
            expectError(new UnprocessableEntityException(), res.json);
          });
      });
    });
  });

  describe('when the password does not match in db', () => {
    it('should return 422', async () => {
      await app
        .inject({
          method: 'POST',
          url: '/auth/login',
          payload: { email: credentials.email, password: 'wrongPassword' },
        })
        .then((res) => {
          expectError(new UnprocessableEntityException(), res.json);
        });
    });
  });
});
