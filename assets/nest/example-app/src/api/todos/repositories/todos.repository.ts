import { rethrowError } from '@utils/error';
import { NestKnexService } from '@database/nest-knex.service';
import { Paginated } from '@utils/query/pagination';
import { Todo } from '../entities/todo.entity';
import { Injectable } from '@nestjs/common';
import {
  CreateTodoInput,
  FindAllTodosInput,
  FindOneTodoInput,
  UpdateTodoInput,
} from '../interfaces/todos.interface';
import { definedOrNotFound } from '@utils/query';
import { TodoUserNotFound } from '../error-mappings/todo-user-not-found.error-mapping';
import { Errors } from '@utils/api/response';

@Injectable()
export class TodosRepository {
  constructor(private readonly knex: NestKnexService) { }

  async create(input: CreateTodoInput): Promise<Todo> {
    return this.knex
      .connection('todos')
      .insert({ ...input.createTodoDto, userId: input.userId })
      .returning('*')
      .then(([todo]: Todo[]) => todo)
      .catch(rethrowError(TodoUserNotFound));
  }

  async findOne(input: Partial<FindOneTodoInput>): Promise<Todo | undefined> {
    return this.knex
      .connection('todos')
      .where({ ...input })
      .first();
  }

  async findOneOrFail(input: Partial<FindOneTodoInput>): Promise<Todo> {
    return this.knex
      .connection('todos')
      .where({ ...input })
      .first()
      .then(definedOrNotFound(Errors.NotFound));
  }

  async update(input: UpdateTodoInput): Promise<Todo | undefined> {
    const { id, userId, updateTodoDto } = input;

    return this.knex
      .connection('todos')
      .where({ id, userId })
      .update(updateTodoDto)
      .returning('*')
      .then(([todo]: Todo[]) => todo)
      .catch(rethrowError(TodoUserNotFound));
  }

  async remove(input: FindOneTodoInput): Promise<number> {
    return this.knex
      .connection('todos')
      .where({ ...input })
      .del();
  }

  async findAll(input: FindAllTodosInput): Promise<Paginated<Todo>> {
    const { userId, query: { pageNumber, pageSize, column, order } } = input;

    const offset = (pageNumber - 1) * pageSize;
    const qb = this.knex.connection('todos').where({ userId });

    if (input.query.name) {
      qb.where({
        name: input.query.name
      })
    }

    if (typeof input.query.completed === 'boolean') {
      qb.where({
        completed: input.query.completed
      })
    }

    const totalCount = await qb
      .clone()
      .count()
      .first();

    if (order && column) {
      qb.orderBy(column, order)
    }

    const items = await qb
      .clone()
      .limit(pageSize)
      .offset(offset);

    return {
      items,
      total: parseInt(totalCount.count),
      totalPages: Math.ceil(parseInt(totalCount.count) / pageSize),
      currentPage: pageNumber,
    }
  }
}
