import { Knex } from 'knex';
import { InsertTodo, Todo, UpdateTodo } from '../models';
import { listTodosFilterMap, listTodosMaps, ListTodosQuery } from '../queries';
import {
  first,
  parseCount,
  extractPagination,
  handleDbError,
  Paginated,
} from '../utils';
import { TodosRepositoryInterface } from './todos.repository.interface';

export class TodosRepository implements TodosRepositoryInterface {
  constructor(private readonly knex: Knex) {}

  async insertOne(input: InsertTodo): Promise<Todo> {
    return await this.knex('todos')
      .insert(input)
      .returning('*')
      .then(first)
      .catch(handleDbError);
  }

  async findById(id: Todo['id']): Promise<Todo | undefined> {
    return await this.knex('todos')
      .where({ id })
      .whereNull('deletedAt')
      .first();
  }

  async updateById(
    id: Todo['id'],
    input: UpdateTodo
  ): Promise<Todo | undefined> {
    if (Object.keys(input).length === 0) {
      return this.findById(id);
    }

    return await this.knex('todos')
      .where({ id })
      .whereNull('deletedAt')
      .update(input)
      .returning('*')
      .then(first)
      .catch(handleDbError);
  }

  async deleteById(id: Todo['id']): Promise<number> {
    return await this.knex('todos')
      .where({ id })
      .whereNull('deletedAt')
      .update('deletedAt', new Date());
  }

  async list(query: ListTodosQuery): Promise<Paginated<Todo>> {
    const qb = this.knex('todos').whereNull('deletedAt');

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
  }
}
