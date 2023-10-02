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
import { SortOrder, definedOrNotFound } from '@utils/query';
import { TodoUserNotFound } from '../error-mappings/todo-user-not-found.error-mapping';
import { Errors, paginatedResponse } from '@utils/api/response';
import { BaseRepository } from '@database/base-repository.repository';
import { Tables } from '@database/constants';

@Injectable()
export class TodosRepository extends BaseRepository<Todo> {
  constructor(private readonly knex: NestKnexService) {
    super(knex, Tables.Todos);
  }

  async create(input: CreateTodoInput): Promise<Todo> {
    return this.repository()
      .insert({ ...input.createTodoDto, userId: input.userId })
      .returning('*')
      .then(([todo]: Todo[]) => todo)
      .catch(rethrowError(TodoUserNotFound));
  }

  async findOne(input: Partial<FindOneTodoInput>): Promise<Todo | undefined> {
    return this.repository()
      .where({ ...input })
      .first();
  }

  async findOneOrFail(input: Partial<FindOneTodoInput>): Promise<Todo> {
    return this.repository()
      .where({ ...input })
      .first()
      .then(definedOrNotFound(Errors.NotFound));
  }

  async update(input: UpdateTodoInput): Promise<Todo | undefined> {
    const { id, userId, updateTodoDto } = input;

    return this.repository()
      .where({ id, userId })
      .update(updateTodoDto)
      .returning('*')
      .then(([todo]: Todo[]) => todo)
      .catch(rethrowError(TodoUserNotFound));
  }

  async remove(input: FindOneTodoInput): Promise<number> {
    return this.repository()
      .where({ ...input })
      .del();
  }

  async findAll(input: FindAllTodosInput): Promise<Paginated<Todo>> {
    const { userId, query } = input;

    const qb = this.repository().where({ userId }).filter(query.filters, {
      name: this.whereLike,
      completed: this.where,
    });

    const items = await qb
      .clone()
      .sort(query.sorts, {
        name: this.orderBy,
        createdAt: this.orderBy,
      })
      .paginate(query.pagination);

    const count = await qb.clone().count().first();

    return paginatedResponse(items, Number(count), query.pagination);
  }
}
