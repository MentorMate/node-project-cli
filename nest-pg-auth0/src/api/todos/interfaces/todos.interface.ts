import { CreateTodoDto, FindAllTodosQueryDto, UpdateTodoDto } from '../dto';

interface UserData {
  userId: string;
}

interface TodoId {
  id?: string;
}

export interface CreateTodoInput extends UserData {
  createTodoDto: CreateTodoDto;
}

export interface FindAllTodosInput extends UserData {
  query: FindAllTodosQueryDto;
}

export interface FindOneTodoInput extends UserData, TodoId, UpdateTodoDto {}

export interface UpdateTodoInput extends FindOneTodoInput {
  updateTodoDto: UpdateTodoDto;
}
