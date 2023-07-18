import { Knex } from 'knex';
import { rethrowError } from '@utils/error';
import { Paginated, extractPagination, parseCount } from '@utils/query';
import { InsertTodo, ListTodosQuery, Todo, UpdateTodo } from '../entities';
import { TodoUserNotFound } from '../error-mappings';
import { filterByCompleted, filterByName } from '../filters';
import { TodosRepositoryInterface } from '../interfaces';
import { sortByCreatedAt, sortByName } from '../sorters';

export class TodosRepository implements TodosRepositoryInterface {
  constructor(private readonly knex: Knex) {}

  async insertOne(input: InsertTodo): Promise<Todo> {
    return await this.knex('todos')
      .insert(input)
      .returning('*')
      .then(([todo]) => todo)
      .catch(rethrowError(TodoUserNotFound));
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
      .then(([todo]) => todo)
      .catch(rethrowError(TodoUserNotFound));
  }

  async deleteById(id: Todo['id'], userId: Todo['userId']): Promise<number> {
    return await this.knex('todos').where({ id, userId }).del();
  }

  async list(
    userId: Todo['userId'],
    query: ListTodosQuery
  ): Promise<Paginated<Todo>> {
    const qb = this.knex('todos').where({ userId });

    const data = await qb
      .clone()
      .filter(query.filters, {
        name: filterByName,
        completed: filterByCompleted,
      })
      .sort(query.sorts, {
        name: sortByName,
        createdAt: sortByCreatedAt,
      })
      .paginate(query.pagination);

    const total = await qb
      .clone()
      .filter(query.filters, {
        name: filterByName,
        completed: filterByCompleted,
      })
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
