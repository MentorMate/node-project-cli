import {
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { TodosRepository } from './repositories/todos.repository';
import { Paginated } from '@utils/query/pagination';
import { Todo } from './entities/todo.entity';
import {
  CreateTodoInput,
  FindAllTodosInput,
  FindOneTodoInput,
  UpdateTodoInput,
} from './interfaces/todos.interface';
import { definedOrNotFound } from '@utils/query';
import { Errors } from '@utils/api/response';

@Injectable()
export class TodosService {
  constructor(
    @Inject(TodosRepository)
    private readonly todos: TodosRepository,
  ) {}

  async create(input: CreateTodoInput): Promise<Todo> {
    const {
      userId,
      createTodoDto: { name },
    } = input;

    const todo = await this.todos.findOne({ userId, name });

    if (todo) {
      throw new UnprocessableEntityException(Errors.UnprocessableEntity);
    }

    return this.todos.create(input);
  }

  findAll(input: FindAllTodosInput): Promise<Paginated<Todo>> {
    return this.todos.findAll(input);
  }

  findOne(input: Partial<FindOneTodoInput>): Promise<Todo | undefined> {
    return this.todos.findOne(input);
  }

  findOneOrFail(input: Partial<FindOneTodoInput>): Promise<Todo> {
    return this.todos.findOneOrFail(input);
  }

  update(input: UpdateTodoInput): Promise<Todo> {
    const { id, userId, updateTodoDto } = input;

    if (Object.keys(updateTodoDto).length === 0) {
      return this.findOneOrFail({ id, userId });
    }

    return this.todos.update(input).then(definedOrNotFound(Errors.NotFound));
  }

  async remove(input: FindOneTodoInput): Promise<number> {
    const todo = await this.findOne({ id: input.id });
    if (!todo) {
      throw new NotFoundException(Errors.NotFound);
    }

    return this.todos.remove(input);
  }
}
