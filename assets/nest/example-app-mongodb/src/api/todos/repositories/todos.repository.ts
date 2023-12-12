import { rethrowError } from '@utils/error';
import { Paginated } from '@utils/query/pagination';
import { Todo } from '../entities';
import { Injectable } from '@nestjs/common';
import {
  CreateTodoInput,
  FindAllTodosInput,
  FindOneTodoInput,
  UpdateTodoInput,
} from '../interfaces/todos.interface';
import { definedOrNotFound, SortOrder } from '@utils/query';
import { TodoUserNotFound } from '../error-mappings';
import { paginatedResponse } from '@utils/api/response';
import { BaseRepository } from '@database/base-repository.repository';
import { Tables } from '@database/constants';
import { Errors } from '@utils/enums';
import { DatabaseService } from '@database/database.service';
import { ObjectId } from 'mongodb';
import { NullableKeysPartial } from '@utils/interfaces';

@Injectable()
export class TodosRepository extends BaseRepository<Todo> {
  constructor(private readonly mongodb: DatabaseService) {
    super(mongodb, Tables.Todos);
  }

  async create(input: CreateTodoInput): Promise<ObjectId> {
    const todo = {
      _id: new ObjectId(),
      userId: input.userId,
      ...input.createTodoDto,
      // Why do we need it in the input?
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    return this.repository()
      .insertOne(todo)
      .then((value) => value.insertedId)
      .catch(rethrowError(TodoUserNotFound));
  }

  async findOne(
    input: Partial<FindOneTodoInput>,
  ): Promise<NullableKeysPartial<Todo> | null> {
    return this.repository().findOne(input);
  }

  async findOneOrFail(
    input: Partial<FindOneTodoInput>,
  ): Promise<NullableKeysPartial<Todo>> {
    return this.repository()
      .findOne(input)
      .then(definedOrNotFound(Errors.NotFound));
  }

  async update(
    input: UpdateTodoInput,
  ): Promise<NullableKeysPartial<Todo> | null> {
    const { _id, userId, updateTodoDto } = input;

    return this.repository()
      .findOneAndUpdate(
        { _id, userId },
        { $set: updateTodoDto },
        { returnDocument: 'after' },
      )
      .catch(rethrowError(TodoUserNotFound));
  }

  async remove(
    input: FindOneTodoInput,
  ): Promise<NullableKeysPartial<Todo> | null> {
    return this.repository().findOneAndDelete(input);
  }

  async findAll(
    input: FindAllTodosInput,
  ): Promise<Paginated<NullableKeysPartial<Todo>>> {
    const {
      userId,
      query: { pageNumber, pageSize, name, completed, column, order },
    } = input;

    const pagination = { pageNumber, pageSize };
    const filters = Object.entries({ userId, name, completed })
      .filter(([, v]) => v !== undefined)
      .reduce((obj: Record<string, unknown>, [k, v]) => {
        obj[k] = v;
        return obj;
      }, {});

    let cursor = this.repository().find(filters);

    if (column) {
      const sortOrder = order === SortOrder.Asc ? 1 : -1;
      cursor = cursor.sort(column, sortOrder);
    }

    const items = await cursor
      .skip(((pageNumber as number) - 1) * (pageSize as number))
      .limit(pageSize as number)
      .toArray();

    const count = await this.count();

    return paginatedResponse(items, count, pagination);
  }
}
