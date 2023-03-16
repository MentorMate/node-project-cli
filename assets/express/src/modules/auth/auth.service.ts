import { handleDbError, UserRepository } from '@database';
import { definedOrNotFound, loggedInOrUnauthorized } from '@common';
import { AuthInput, User } from '@modules';
import { compareHash, signToken } from '../utils';
import { AuthService } from './interfaces';

export function initializeAuthService({
  userRepository,
}: {
  userRepository: UserRepository;
}): AuthService {
  return {
    login: async function (payload: AuthInput) {
      const { email, password } = payload;

      try {
        const user = await userRepository.find(email);
        if (user) {
          const validPassword = await compareHash(password, user.password);
          const idToken = signToken(email);

          if (validPassword) {
            return {
              idToken,
            };
          }
          loggedInOrUnauthorized('Passwords do not match!')(validPassword);
        }
        definedOrNotFound<User>('User not found')(user);
      } catch (err) {
        handleDbError(err);
      }
    },
  };
}
