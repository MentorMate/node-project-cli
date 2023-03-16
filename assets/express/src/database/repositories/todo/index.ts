import {
  first,
  parseCount,
  extractPagination,
  Paginated,
} from '../../utils';
import {
  ListTodosQuery,
  listTodosMaps,
  listTodosFilterMap,
} from './interfaces';
import { Todo, CreateTodoInput, UpdateTodoInput } from '@modules';
import { initializeKnex } from '../../initilize-knex';

export * from './interfaces';

export function initializeTodoRepository(
  knex: ReturnType<typeof initializeKnex>
) {
  return {
    create: async function (input: CreateTodoInput): Promise<Todo> {
      return await knex('todos').insert(input).returning('*').then(first);
    },
    // TODO: Handle the empty object in request body:
    // Empty .update() call detected! Update data does not contain any values to update. This will result in a faulty query
    update: async function (
      id: number,
      input: UpdateTodoInput
    ): Promise<Todo | undefined> {
      return await knex('todos')
        .where({ id })
        .whereNull('deletedAt')
        .update(input)
        .returning('*')
        .then(first);
    },
    delete: async function (id: number): Promise<number> {
      return await knex('todos')
        .where({ id })
        .whereNull('deletedAt')
        .update('deletedAt', new Date());
    },
    find: async function (id: number): Promise<Todo | undefined> {
      return await knex('todos').where({ id }).whereNull('deletedAt').first();
    },
    list: async function (query: ListTodosQuery): Promise<Paginated<Todo>> {
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
  };
}
