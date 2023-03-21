import { UserRepository } from '@database';
import { definedOrNotFound, updatedOrNotFound } from '@common';
import { hashPassword } from '../auth/utils';
import { UserService } from './interfaces';

export const createUserService = (users: UserRepository): UserService => ({
  find(email) {
    return users.find(email).then(definedOrNotFound('User not found'));
  },
  list(query) {
    return users.list(query);
  },
  async create(payload) {
    const { email, password, ...attributes } = payload;
    const hashedPassword = await hashPassword(password);

    const user = await users.create({
      email,
      password: hashedPassword,
      ...attributes,
      role: 'user',
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
