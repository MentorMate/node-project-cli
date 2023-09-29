import { DuplicateRecordError } from '@database/errors';
import { User } from '@api/users/entities';
import { UsersRepository } from '@api/users/repositories';
import { JwtToken } from '../entities';
import { JwtService } from './jwt.service';
import { PasswordService } from './password.service';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { Environment } from '@utils/environment';
import { UnprocessableEntityException } from '@nestjs/common';

jest.mock('../../users/repositories/users.repository');

describe('AuthService', () => {
  const env = {
    JWT_SECRET: 'very-secret',
    JWT_EXPIRATION: '1d',
  };

  const config = {
    get: (key: keyof typeof env) => env[key],
  } as never as ConfigService<Environment>;
  const jwt = new JwtService(config);
  const passwords = new PasswordService();
  const users = new UsersRepository({} as never);
  const auth = new AuthService(users, jwt, passwords);

  describe('register', () => {
    describe('when the email is not regisered', () => {
      const creds = { email: 'new-email@example.com', password: 'very-secret' };
      let result: JwtToken;
      let user: User | undefined;

      beforeAll(async () => {
        result = await auth.register(creds);
        user = await users.findByEmail(creds.email);
      });

      it('should register the email', async () => {
        expect(user).toBeDefined();
      });

      it('should hash the user password', async () => {
        expect(user?.password).not.toBe(creds.password);
      });

      it('should return jwt tokens', () => {
        expect(result).toEqual(
          expect.objectContaining({ idToken: expect.any(String) }),
        );
      });
    });

    describe('when the email is already registered', () => {
      const creds = {
        email: 'registered-email@example.com',
        password: 'very-secret',
      };

      beforeAll(async () => {
        await auth.register(creds);
      });

      it('should throw an error', async () => {
        await expect(auth.register(creds)).rejects.toThrowError(
          DuplicateRecordError,
        );
      });
    });
  });

  describe('login', () => {
    describe('when the email is not registered', () => {
      it('should return undefined', async () => {
        await expect(
          auth.login({
            email: 'notregistered@email.com',
            password: '123',
          }),
        ).rejects.toThrowError(
          new UnprocessableEntityException('Invalid email or password'),
        );
      });
    });

    describe('when the email is registered', () => {
      const creds = { email: 'registered@email.com', password: 'very-secret' };

      beforeAll(async () => {
        await auth.register(creds);
      });

      describe('and the password does not match', () => {
        it('should return undefined', async () => {
          await expect(
            auth.login({
              email: creds.email,
              password: 'not-my-password',
            }),
          ).rejects.toThrowError(
            new UnprocessableEntityException('Invalid email or password'),
          );
        });
      });

      describe('and the email and password are valid', () => {
        it('should return jwt tokens', async () => {
          expect(await auth.login(creds)).toEqual(
            expect.objectContaining({ idToken: expect.any(String) }),
          );
        });
      });
    });
  });
});
