import {
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { TodosRepository } from './repositories';
import { Paginated, definedOrNotFound } from '@utils/query';
import { Todo } from './entities/todo.entity';
import {
  CreateTodoInput,
  FindAllTodosInput,
  FindOneTodoInput,
  UpdateTodoInput,
} from './interfaces';
import { Errors } from '@utils/enums';
import { NullableKeysPartial } from '@utils/interfaces';
import { ObjectId } from 'mongodb';

@Injectable()
export class TodosService {
  constructor(
    @Inject(TodosRepository)
    private readonly todos: TodosRepository
  ) {}

  async create(input: CreateTodoInput): Promise<ObjectId> {
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

  findAll(
    input: FindAllTodosInput
  ): Promise<Paginated<NullableKeysPartial<Todo>>> {
    return this.todos.findAll(input);
  }

  findOneOrFail(
    input: Partial<FindOneTodoInput>
  ): Promise<NullableKeysPartial<Todo>> {
    return this.todos.findOneOrFail(input);
  }

  update(input: UpdateTodoInput): Promise<NullableKeysPartial<Todo>> {
    const { _id, userId, updateTodoDto } = input;

    if (Object.keys(updateTodoDto).length === 0) {
      return this.findOneOrFail({ _id, userId });
    }

    return this.todos.update(input).then(definedOrNotFound(Errors.NotFound));
  }

  async remove(input: FindOneTodoInput): Promise<boolean> {
    input._id = new ObjectId(input._id);

    const deletedTodo = await this.todos.remove(input);
    if (!deletedTodo) {
      throw new NotFoundException(Errors.NotFound);
    }

    return true;
  }
}
