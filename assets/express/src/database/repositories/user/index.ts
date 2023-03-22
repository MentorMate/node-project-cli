import { Knex } from 'knex';
import {
  first,
  parseCount,
  extractPagination,
  handleDbError,
} from '../../utils';
import { UserRepository } from '../../interfaces';
import { listUsersMaps, listUsersFilterMap } from './interfaces';

export * from './interfaces';

export const createUserRepository = (knex: Knex): UserRepository => ({
  async create(input) {
    return await knex('users')
      .insert(input)
      .returning('*')
      .then(first)
      .catch(handleDbError);
  },
  // TODO: Handle the empty object in request body:
  // Empty .update() call detected! Update data does not contain any values to update. This will result in a faulty query
  async update(email, input) {
    return await knex('users')
      .where({ email })
      .whereNull('deletedAt')
      .update(input)
      .returning('*')
      .then(first)
      .catch(handleDbError);
  },
  async delete(email) {
    return await knex('users')
      .where({ email })
      .whereNull('deletedAt')
      .update('deletedAt', new Date());
  },
  async find(email) {
    return await knex('users').where({ email }).whereNull('deletedAt').first();
  },
  async list(query) {
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
  },
});
