import { Knex } from 'knex';
import {
  first,
  parseCount,
  extractPagination,
  handleDbError,
} from '../../utils';
import { TodoRepository } from '../../interfaces';
import { listTodosMaps, listTodosFilterMap } from './interfaces';

export * from './interfaces';

export const createTodoRepository = (knex: Knex): TodoRepository => ({
  async create(input) {
    return await knex('todos')
      .insert(input)
      .returning('*')
      .then(first)
      .catch(handleDbError);
  },
  // TODO: Handle the empty object in request body:
  // Empty .update() call detected! Update data does not contain any values to update. This will result in a faulty query
  async update(id, input) {
    return await knex('todos')
      .where({ id })
      .whereNull('deletedAt')
      .update(input)
      .returning('*')
      .then(first)
      .catch(handleDbError);
  },
  async delete(id) {
    return await knex('todos')
      .where({ id })
      .whereNull('deletedAt')
      .update('deletedAt', new Date());
  },
  async find(id) {
    return await knex('todos').where({ id }).whereNull('deletedAt').first();
  },
  async list(query) {
    const qb = knex('todos').whereNull('deletedAt');

    const data = await qb.clone().list(query, listTodosMaps);

    const total = await qb
      .clone()
      .filter(query.filters, listTodosFilterMap)
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
