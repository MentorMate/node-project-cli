import { handleDbError, UserRepository } from '@database';
import { definedOrNotFound, loggedInOrUnauthorized } from '@common';
import { TokensService, User } from '@modules';
import { compareHash, hashPassword, signToken } from './utils';
import { AuthService } from './interfaces';

export const createAuthService = (users: UserRepository, tokens: TokensService): AuthService => {
  const jwtConfig = tokens.getJwtConfig();

  return {
    login: async function (payload) {
      const { email, password } = payload;

      try {
        const user = await users.find(email);

        if (user) {
          const validPassword = await compareHash(password, user.password);
          const idToken = signToken({ email }, jwtConfig);

          if (validPassword) {
            return {
              idToken,
            };
          }
          loggedInOrUnauthorized('Invalid email or password')(validPassword);
        }
        definedOrNotFound<User>('User not found')(user);
      } catch (err) {
        handleDbError(err);
      }
    },
    register: async function (payload) {
      const { email, password } = payload;

      try {
        const hashedPassword = await hashPassword(password);
        const user = await users.create({
          email,
          password: hashedPassword,
          role: 'user',
        });

        if (user) {
          const idToken = signToken({ sub: user.id, email }, jwtConfig);
          return {
            idToken,
          };
        }
        definedOrNotFound<User>('User not found')(user);
      } catch (err) {
        handleDbError(err);
      }
    },
  };
}
