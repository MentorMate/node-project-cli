import {
  CreateTodoInput,
  FindAllTodosInput,
  FindOneTodoInput,
  UpdateTodoInput,
} from '../interfaces/todos.interface';
import { Paginated } from '@utils/query';
import { Todo } from '../entities';
import { TodosSortBy, UpdateTodoDto } from '../dto';
import { UserData } from '@api/auth/interfaces';
import { ObjectId } from 'mongodb';

export const mockedUser: UserData = {
  user: {
    sub: new ObjectId(100).toString(),
    email: 'example@email.com',
  },
};

const userId = new ObjectId(mockedUser.user.sub);

export const todo: Todo = {
  _id: new ObjectId(1),
  name: 'todo',
  note: null,
  completed: false,
  createdAt: new Date('2023-09-01T09:44:15.515Z').getTime(),
  updatedAt: new Date('2023-09-01T09:44:15.515Z').getTime(),
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
  _id: todo._id,
  updateTodoDto: updateTodoDtoInput,
  userId,
};

export const findOneTodoInput: FindOneTodoInput = {
  _id: todo._id,
  userId,
};

export const findAllTodosInput: FindAllTodosInput = {
  query: {
    pageNumber: 1,
    pageSize: 20,
    column: TodosSortBy.CreatedAt,
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
