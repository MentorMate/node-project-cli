import { UserData } from '@api/auth/entities';
import { Todo } from '../entities/todo.entity';

export const exampleUser: UserData = {
  user: {
    sub: '1',
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
  userId: +exampleUser.user.sub,
};
