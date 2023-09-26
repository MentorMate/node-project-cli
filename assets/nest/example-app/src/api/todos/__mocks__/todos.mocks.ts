import { UserData } from '@api/auth/entities';
import { Todo } from '../entities/todo.entity';
import { CreateTodoInput } from '../interfaces/todos.interface';
import { Paginated } from '@utils/query';
import { UpdateTodoDto } from '../dto/update-todo.dto';

export const mockedUser: UserData = {
  user: {
    sub: 1,
    email: 'example@email.com',
  },
};

export const todo: Todo = {
  id: 1,
  name: 'todo',
  note: null,
  completed: false,
  createdAt: '2023-09-01T09:44:15.515Z',
  updatedAt: '2023-09-01T09:44:15.515Z',
  userId: mockedUser.user.sub,
};

export const createTodoInput: CreateTodoInput = {
  createTodoDto: {
    name: todo.name,
    completed: todo.completed,
    note: todo.note,
  },
  userId: mockedUser.user.sub,
};

export const updateTodoInput: UpdateTodoDto = {
  name: 'new name',
  note: 'new note',
  completed: true,
};

export const getPaginatedResponse = <T>(data: T[]): Paginated<T> => {
  return { data, meta: { total: data.length } };
};
