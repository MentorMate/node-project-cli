import { Knex } from 'knex';
import { Inject, Service } from 'typedi';
import { DB_CLIENT } from '@common/di';
import { Paginated } from '@common/query';
import { mapErrors } from '@common/utils';
import { InsertTodo, Todo, UpdateTodo } from '../models';
import { listTodosMaps, ListTodosQuery } from '../queries';
import { first, parseCount, extractPagination } from '../utils';
import { TodoUserNotFound } from './todos.error-mappings';
import { TodosRepositoryInterface } from './todos.repository.interface';

@Service()
export class TodosRepository implements TodosRepositoryInterface {
  constructor(@Inject(DB_CLIENT) private readonly knex: Knex) {}

  async insertOne(input: InsertTodo): Promise<Todo> {
    return await this.knex('todos')
      .insert(input)
      .returning('*')
      .then(first)
      .catch(mapErrors(TodoUserNotFound));
  }

  async findById(
    id: Todo['id'],
    userId: Todo['userId']
  ): Promise<Todo | undefined> {
    return await this.knex('todos').where({ id, userId }).first();
  }

  async updateById(
    id: Todo['id'],
    userId: Todo['userId'],
    input: UpdateTodo
  ): Promise<Todo | undefined> {
    if (Object.keys(input).length === 0) {
      return this.findById(id, userId);
    }

    return await this.knex('todos')
      .where({ id, userId })
      .update(input)
      .returning('*')
      .then(first)
      .catch(mapErrors(TodoUserNotFound));
  }

  async deleteById(id: Todo['id'], userId: Todo['userId']): Promise<number> {
    return await this.knex('todos').where({ id, userId }).del();
  }

  async list(
    userId: Todo['userId'],
    query: ListTodosQuery
  ): Promise<Paginated<Todo>> {
    const qb = this.knex('todos').where({ userId });
    const data = await qb.clone().list(query, listTodosMaps);

    const total = await qb
      .clone()
      .filter(query.filters, listTodosMaps.filterMap)
      .count()
      .then(parseCount);

    return {
      data: data,
      meta: {
        ...extractPagination(query.pagination),
        total,
      },
    };
  }
}
