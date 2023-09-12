import { rethrowError } from '@utils/error';
import { TodoUserNotFound } from '../error-mappings';
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

@Injectable()
export class TodosRepository {
  constructor(private readonly knex: NestKnexService) {}

  async create(input: CreateTodoInput): Promise<Todo> {
    return await this.knex
      .connection('todos')
      .insert({ ...input.createTodoDto, userId: input.userId })
      .returning('*')
      .then(([todo]: Todo[]) => todo)
      .catch(rethrowError(TodoUserNotFound));
  }

  async findOne(input: FindOneTodoInput): Promise<Todo | undefined> {
    return await this.knex
      .connection('todos')
      .where({ ...input })
      .first();
  }

  async update(input: UpdateTodoInput): Promise<Todo | undefined> {
    const { id, userId, updateTodoDto } = input;

    if (Object.keys(updateTodoDto).length === 0) {
      return this.findOne({ id, userId });
    }

    return await this.knex
      .connection('todos')
      .where({ id, userId })
      .update(updateTodoDto)
      .returning('*')
      .then(([todo]: Todo[]) => todo)
      .catch(rethrowError(TodoUserNotFound));
  }

  async remove(input: FindOneTodoInput): Promise<number> {
    return await this.knex
      .connection('todos')
      .where({ ...input })
      .del();
  }

  async findAll(input: FindAllTodosInput): Promise<Paginated<Todo>> {
    const { userId, query } = input;
    const qb = await this.knex.connection('todos').where({ userId });

    //TODO: implement pagination
    // const data = await qb.clone()
    // .filter(query.filters, {
    //   name: (qb: any, name: string) => qb.whereILike('name', `%${name}%`),
    //   completed: (qb: any, completed: boolean) => qb.where({ completed }),
    // })
    // .sort(query.sorts, {
    //   name: (qb: any, order: string) => qb.orderBy('name', order),
    //   createdAt: (qb: any, order: string) => qb.orderBy('createdAt', order),
    // })
    // .paginate(query.pagination);

    // const total = await qb
    //   .clone()
    //   // .filter(query.filters, {
    //   //   name: (qb: any, name: string) => qb.whereILike('name', `%${name}%`),
    //   //   completed: (qb: any, completed: boolean) => qb.where({ completed }),
    //   // })
    //   .count()
    //   .then(parseCount);

    return {
      data: qb,
      meta: {
        ...extractPagination(query.pagination),
        // TODO: To be fixed with pagination implementation
        total: 0,
      },
    };
  }
}
