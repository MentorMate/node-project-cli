import {
  first,
  parseCount,
  extractPagination,
  handleDbError,
  Paginated,
} from '@database';
import {
  ListUsersQuery,
  listUsersMaps,
  listUsersFilterMap,
} from './interfaces';
import { User, CreateUserInput, UpdateUserInput } from '@modules';
import { definedOrNotFound, updatedOrNotFound } from '@common';
import { initializeKnex } from '../../initilize-knex';

export * from './interfaces';

export const initializeUserRepository = (
  knex: ReturnType<typeof initializeKnex>
) => {
  const create = async function (input: CreateUserInput): Promise<User> {
    return await knex('users')
      .insert(input)
      .returning('*')
      .then(first)
      .catch(handleDbError);
  };
  // TODO: Handle the empty object in request body:
  // Empty .update() call detected! Update data does not contain any values to update. This will result in a faulty query
  const update = async function (
    email: string,
    input: UpdateUserInput
  ): Promise<User | undefined> {
    return await knex('users')
      .where({ email })
      .whereNull('deletedAt')
      .update(input)
      .returning('*')
      .then(first)
      .catch(handleDbError)
      .then(definedOrNotFound('User not found'));
  };
  const deleteMethod = async function (email: string): Promise<number> {
    return await knex('users')
      .where({ email })
      .whereNull('deletedAt')
      .update('deletedAt', new Date())
      .then(updatedOrNotFound('User not found'));
  };
  const find = async function (email: string): Promise<User | undefined> {
    return await knex('users')
      .where({ email })
      .whereNull('deletedAt')
      .first()
      .then(definedOrNotFound('User not found'));
  };
  const list = async function (
    query: ListUsersQuery
  ): Promise<Paginated<User>> {
    const qb = knex('users').whereNull('deletedAt');

    const data = await qb.clone().list(query, listUsersMaps);

    const total = await qb
      .clone()
      .filter(query.filters, listUsersFilterMap)
      .count()
      .then(parseCount);

    return {
      data: data,
      meta: {
        ...extractPagination(query.pagination),
        total,
      },
    };
  };

  return {
    create,
    update,
    delete: deleteMethod,
    find,
    list,
  };
};
