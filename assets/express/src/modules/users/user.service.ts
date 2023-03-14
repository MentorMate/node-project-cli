import { UserRepository, handleDbError, ListUsersQuery } from '@database';
import { definedOrNotFound, updatedOrNotFound } from '@common';
import { User, CreateUserInput, UpdateUserInput } from '..';
import { hashPassword } from './utils';
import { UserService } from './interfaces';

export function initializeUserService({
  userRepository,
}: {
  userRepository: UserRepository;
}): UserService {
  return {
    find: async function (email: string) {
      let user;

      try {
        user = await userRepository.find(email);
      } catch (err) {
        handleDbError(err);
      }

      return definedOrNotFound<User>('User not found')(user);
    },
    list: async function (query: ListUsersQuery) {
      let users;

      try {
        users = await userRepository.list(query);
      } catch (err) {
        handleDbError(err);
      }

      return users;
    },
    create: async function (payload: CreateUserInput) {
      const { email, password, ...attributes } = payload;
      let user;

      try {
        const hashedPassword = await hashPassword(10, password);
        user = await userRepository.create({
          email,
          password: hashedPassword,
          ...attributes,
          role: 'user',
        });
      } catch (err) {
        handleDbError(err);
      }

      return user;
    },
    update: async function (email: string, payload: UpdateUserInput) {
      let updatedUser;

      try {
        updatedUser = await userRepository.update(email, payload);
      } catch (err) {
        handleDbError(err);
      }

      return definedOrNotFound<User>('User not found')(updatedUser);
    },
    delete: async function (email: string) {
      let deletedEntries = 0;

      try {
        deletedEntries = await userRepository.delete(email);
      } catch (err) {
        handleDbError(err);
      }

      return updatedOrNotFound('User not found')(deletedEntries);
    },
  };
}