import { UsersRepositoryInterface } from '@modules/database';
import { definedOrNotFound, loggedInOrUnauthorized } from '@common';
import { JwtService, PasswordService } from '@modules';
import { AuthService } from './interfaces';

export const createAuthService = (
  users: UsersRepositoryInterface,
  jwtService: JwtService,
  passwordService: PasswordService
): AuthService => {
  return {
    async login({ email, password }) {
      const user = await users.findByEmail(email);

      if (user) {
        const validPassword = await passwordService.compareHash(
          password,
          user.password
        );
        const idToken = jwtService.sign({ email });

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
      const hashedPassword = await passwordService.hashPassword(password);

      const user = await users.insertOne({
        email,
        password: hashedPassword,
      });

      if (user) {
        const idToken = jwtService.sign({ sub: user.id, email });
        return {
          idToken,
        };
      }
      definedOrNotFound('User not found');
    },
  };
};
