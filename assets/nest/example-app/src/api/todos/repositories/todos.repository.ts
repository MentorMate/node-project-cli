import { rethrowError } from '@utils/error';
import { NestKnexService } from '@database/nest-knex.service';
import { Paginated, extractPagination } from '@utils/query/pagination';
import { Todo } from '../entities/todo.entity';
import { Injectable } from '@nestjs/common';
import {
  CreateTodoInput,
  FindAllTodosInput,
  FindOneTodoInput,
  UpdateTodoInput,
} from '../interfaces/todos.interface';
import { parseCount } from '@utils/query';
import { TodoUserNotFound } from '../error-mappings/todo-user-not-found.error-mapping';

@Injectable()
export class TodosRepository {
  constructor(private readonly knex: NestKnexService) {}

  async create(input: CreateTodoInput): Promise<Todo> {
    return this.knex
      .connection('todos')
      .insert({ ...input.createTodoDto, userId: input.userId })
      .returning('*')
      .then(([todo]: Todo[]) => todo)
      .catch(rethrowError(TodoUserNotFound));
  }

  async findOne(input: FindOneTodoInput): Promise<Todo | undefined> {
    return this.knex
      .connection('todos')
      .where({ ...input })
      .first();
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
    const { userId, query } = input;
    const qb = this.knex.connection('todos').where({ userId });

    const data = await qb
      .clone()
      .filter(query.filters, {
        name: (qb: any, name: string) => qb.whereILike('name', `%${name}%`),
        completed: (qb: any, completed: boolean) => qb.where({ completed }),
      })
      .sort(query.sorts, {
        name: (qb: any, order: string) => qb.orderBy('name', order),
        createdAt: (qb: any, order: string) => qb.orderBy('createdAt', order),
      })
      .paginate(query.pagination);

    const total = await qb
      .clone()
      .filter(query.filters, {
        name: (qb: any, name: string) => qb.whereILike('name', `%${name}%`),
        completed: (qb: any, completed: boolean) => qb.where({ completed }),
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
