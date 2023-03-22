import { UserRepository } from '@database';
import { definedOrNotFound, loggedInOrUnauthorized } from '@common';
import { TokensService } from '@modules';
import { compareHash, hashPassword, signToken } from './utils';
import { AuthService } from './interfaces';

export const createAuthService = (
  users: UserRepository,
  tokens: TokensService
): AuthService => {
  const jwtConfig = tokens.getJwtConfig();

  return {
    async login({ email, password }) {
      const user = await users.find(email);

      if (user) {
        const validPassword = await compareHash(password, user.password);
        const idToken = signToken({ email }, jwtConfig);

        if (validPassword) {
          return {
            idToken,
          };
        }
        loggedInOrUnauthorized('Invalid email or password');
      }
      definedOrNotFound('User not found');
    },
    async register({ email, password }) {
      const hashedPassword = await hashPassword(password);

      const user = await users.create({
        email,
        password: hashedPassword,
      });

      if (user) {
        const idToken = signToken({ sub: user.id, email }, jwtConfig);
        return {
          idToken,
        };
      }
      definedOrNotFound('User not found');
    },
  };
};
