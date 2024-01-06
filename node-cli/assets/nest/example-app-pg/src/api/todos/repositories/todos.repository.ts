import { rethrowError } from '@utils/error';
import { NestKnexService } from '@database/nest-knex.service';
import { Paginated } from '@utils/query/pagination';
import { Todo } from '../entities';
import { Injectable } from '@nestjs/common';
import {
  CreateTodoInput,
  FindAllTodosInput,
  FindOneTodoInput,
  UpdateTodoInput,
} from '../interfaces/todos.interface';
import { definedOrNotFound } from '@utils/query';
import { TodoUserNotFound } from '../error-mappings';
import { paginatedResponse } from '@utils/api/response';
import { BaseRepository } from '@database/base-repository.repository';
import { Tables } from '@database/constants';
import { Errors } from '@utils/enums';

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
    const {
      userId,
      query: { pageNumber, pageSize, name, completed, column, order },
    } = input;

    const pagination = { pageNumber, pageSize };
    const filters = { name, completed };

    const qb = this.repository().where({ userId }).filter(filters, {
      name: this.whereLike,
      completed: this.where,
    });

    const itemsQuery = qb.clone();

    if (column) {
      itemsQuery.sort([{ column, order }], {
        name: this.orderBy,
        createdAt: this.orderBy,
      });
    }

    const items = await itemsQuery.paginate(pagination);

    const count = await this.count(qb);

    return paginatedResponse(items, count, pagination);
  }
}
