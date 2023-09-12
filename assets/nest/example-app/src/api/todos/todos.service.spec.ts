import { DatabaseModule } from '@database/database.module';
import { Test, TestingModule } from '@nestjs/testing';
import { TodosService } from './todos.service';
import { TodosController } from './todos.controller';
import { TodosRepository } from './repositories/todos.repository';
import { CreateTodoInput } from './interfaces/todos.interface';
import { exampleUser, todo } from './__mocks__/todos.mocks';
import { Paginated } from '@utils/query/pagination';
import { Todo } from './entities/todo.entity';
import { UpdateTodoDto } from './dto/update-todo.dto';

describe('TodosService', () => {
  let service: TodosService;
  let repository: TodosRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      controllers: [TodosController],
      providers: [TodosService, TodosRepository],
    }).compile();

    service = module.get<TodosService>(TodosService);
    repository = module.get<TodosRepository>(TodosRepository);
  });

  describe('create', () => {
    it('should return todos', async () => {
      const todoInput: CreateTodoInput = {
        createTodoDto: {
          name: todo.name,
          completed: todo.completed,
          note: todo.note,
        },
        userId: +exampleUser.user.sub,
      };

      jest.spyOn(repository, 'create').mockImplementationOnce(async () => todo);

      expect(await service.create(todoInput)).toStrictEqual(todo);
    });
  });

  describe('findAll', () => {
    it('should return todos', async () => {
      const paginatedResponse: Paginated<Todo> = {
        data: [todo],
        meta: { total: 1 },
      };
      jest
        .spyOn(repository, 'findAll')
        .mockImplementationOnce(async () => paginatedResponse);

      expect(
        await service.findAll({ userId: +exampleUser.user.sub, query: {} }),
      ).toStrictEqual(paginatedResponse);
    });
  });

  describe('findOne', () => {
    it('should return single todo', async () => {
      jest
        .spyOn(repository, 'findOne')
        .mockImplementationOnce(async () => todo);

      expect(
        await service.findOne({ id: todo.id, userId: +exampleUser.user.sub }),
      ).toStrictEqual(todo);
    });
  });

  describe('update', () => {
    it('should update single todo', async () => {
      const inputData: UpdateTodoDto = {
        name: 'new name',
        note: 'add note',
        completed: true,
      };

      const updatedTodo = { ...todo, ...inputData };

      jest
        .spyOn(repository, 'update')
        .mockImplementationOnce(async () => updatedTodo);

      expect(
        await service.update({
          id: todo.id,
          userId: +exampleUser.user.sub,
          updateTodoDto: inputData,
        }),
      ).toStrictEqual(updatedTodo);
    });
  });

  describe('remove', () => {
    it('should delete single todo', async () => {
      jest.spyOn(repository, 'remove').mockImplementationOnce(async () => 1);

      expect(
        await service.remove({ id: 1, userId: +exampleUser.user.sub }),
      ).toBe(1);
    });
  });
});
