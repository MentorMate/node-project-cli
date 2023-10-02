import { UserData } from '@api/auth/entities';
import { Todo } from '../entities/todo.entity';
import {
  CreateTodoInput,
  FindAllTodosInput,
  FindOneTodoInput,
  UpdateTodoInput,
} from '../interfaces/todos.interface';
import { Paginated } from '@utils/query';
import { UpdateTodoDto } from '../dto/update-todo.dto';

export const mockedUser: UserData = {
  user: {
    sub: 1,
    email: 'example@email.com',
  },
};

const userId = mockedUser.user.sub;

export const todo: Todo = {
  id: 1,
  name: 'todo',
  note: null,
  completed: false,
  createdAt: '2023-09-01T09:44:15.515Z',
  updatedAt: '2023-09-01T09:44:15.515Z',
  userId,
};

export const createTodoInput: CreateTodoInput = {
  createTodoDto: {
    name: todo.name,
    completed: todo.completed,
    note: todo.note,
  },
  userId,
};

export const updateTodoDtoInput: UpdateTodoDto = {
  name: 'new name',
  note: 'new note',
  completed: true,
};

export const updateTodoInput: UpdateTodoInput = {
  id: todo.id,
  updateTodoDto: updateTodoDtoInput,
  userId,
};

export const findOneTodoInput: FindOneTodoInput = {
  id: todo.id,
  userId,
};

export const findAllTodosInput: FindAllTodosInput = {
  query: {
    pagination: {
      pageNumber: 1,
      pageSize: 20,
    },
  },
  userId,
};

export const getPaginatedResponse = <T>(data: T[]): Paginated<T> => {
  return {
    items: data,
    total: data.length,
    totalPages: 1,
    currentPage: 1,
  };
};
