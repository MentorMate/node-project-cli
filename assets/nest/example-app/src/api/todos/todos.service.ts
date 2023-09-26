import { Inject, Injectable } from '@nestjs/common';
import { TodosRepository } from './repositories/todos.repository';
import { Paginated } from '@utils/query/pagination';
import { Todo } from './entities/todo.entity';
import {
  CreateTodoInput,
  FindAllTodosInput,
  FindOneTodoInput,
  UpdateTodoInput,
} from './interfaces/todos.interface';
import { definedOrNotFound, updatedOrNotFound } from '@utils/query';

@Injectable()
export class TodosService {
  constructor(
    @Inject(TodosRepository)
    private readonly todos: TodosRepository,
  ) {}

  create(input: CreateTodoInput): Promise<Todo> {
    return this.todos.create(input);
  }

  findAll(input: FindAllTodosInput): Promise<Paginated<Todo>> {
    return this.todos.findAll(input);
  }

  findOne(input: FindOneTodoInput): Promise<Todo> {
    return this.todos.findOne(input).then(definedOrNotFound('To-Do not found'));
  }

  update(input: UpdateTodoInput): Promise<Todo> {
    const { id, userId, updateTodoDto } = input;

    if (Object.keys(updateTodoDto).length === 0) {
      return this.findOne({ id, userId });
    }

    return this.todos.update(input).then(definedOrNotFound('To-Do not found'));
  }

  remove(input: FindOneTodoInput): Promise<number> {
    return this.todos.remove(input).then(updatedOrNotFound('To-Do not found'));
  }
}
