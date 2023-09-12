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

  findOne(input: FindOneTodoInput) {
    return this.todos.findOne(input);
  }

  update(input: UpdateTodoInput) {
    return this.todos.update(input);
  }

  remove(input: FindOneTodoInput) {
    return this.todos.remove(input);
  }
}
