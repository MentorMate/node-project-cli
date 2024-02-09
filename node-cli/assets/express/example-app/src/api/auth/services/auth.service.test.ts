import { DuplicateRecordError } from '@database/errors';
import { User, UsersRepository } from '@api/users';
import { JwtTokens } from '../entities';
import { JwtService } from './jwt.service';
import { PasswordService } from './password.service';
import { AuthService } from './auth.service';

jest.mock('../../users/repositories/users.repository');

describe('AuthService', () => {
  const jwt = new JwtService({
    JWT_SECRET: 'very-secret',
    JWT_EXPIRATION: '1d',
  });
  const passwords = new PasswordService();
  const users = new UsersRepository({} as never);
  const auth = new AuthService(users, jwt, passwords);

  describe('register', () => {
    describe('when the email is not regisered', () => {
      const creds = { email: 'new-email@example.com', password: 'very-secret' };
      let result: JwtTokens;
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
          expect.objectContaining({ idToken: expect.any(String) })
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
        await expect(auth.register(creds)).rejects.toThrow(
          DuplicateRecordError
        );
      });
    });
  });

  describe('login', () => {
    describe('when the email is not registered', () => {
      it('should return undefined', async () => {
        expect(
          await auth.login({
            email: 'notregistered@email.com',
            password: '123',
          })
        ).toBeUndefined();
      });
    });

    describe('when the email is registered', () => {
      const creds = { email: 'registered@email.com', password: 'very-secret' };

      beforeAll(async () => {
        await auth.register(creds);
      });

      describe('and the password does not match', () => {
        it('should return undefined', async () => {
          expect(
            await auth.login({
              email: creds.email,
              password: 'not-my-password',
            })
          ).toBeUndefined();
        });
      });

      describe('and the email and password are valid', () => {
        it('should return jwt tokens', async () => {
          expect(await auth.login(creds)).toEqual(
            expect.objectContaining({ idToken: expect.any(String) })
          );
        });
      });
    });
  });
});
