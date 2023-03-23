import { UserRepository } from '@database';
import { definedOrNotFound, updatedOrNotFound } from '@common';
import { UserService } from './interfaces';
import { PasswordService } from '../password';

export const createUserService = (
  users: UserRepository,
  passwordService: PasswordService
): UserService => ({
  find(email) {
    return users.find(email).then(definedOrNotFound('User not found'));
  },
  list(query) {
    return users.list(query);
  },
  async create(payload) {
    const { email, password, ...attributes } = payload;
    const hashedPassword = await passwordService.hashPassword(password);

    const user = await users.create({
      email,
      password: hashedPassword,
      ...attributes,
    });

    return user;
  },
  update(email, payload) {
    return users
      .update(email, payload)
      .then(definedOrNotFound('User not found'));
  },
  delete(email) {
    return users.delete(email).then(updatedOrNotFound('User not found'));
  },
});
