import { UsersRepository } from '@modules/database';
import { definedOrNotFound, updatedOrNotFound } from '@common';
import { UserService } from './interfaces';
import { PasswordService } from '../password';

export const createUserService = (
  users: UsersRepository,
  passwordService: PasswordService
): UserService => ({
  find(email) {
    return users.findByEmail(email).then(definedOrNotFound('User not found'));
  },
  list(query) {
    return users.list(query);
  },
  async create({ email, password }) {
    const hashedPassword = await passwordService.hashPassword(password);

    const user = await users.insertOne({
      email,
      password: hashedPassword,
    });

    return user;
  },
  update(email, payload) {
    return users
      .updateByEmail(email, payload)
      .then(definedOrNotFound('User not found'));
  },
  delete(email) {
    return users.deleteByEmail(email).then(updatedOrNotFound('User not found'));
  },
});
