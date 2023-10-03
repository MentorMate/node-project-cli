import { CreateTodoDto, FindAllTodosQueryDto, UpdateTodoDto } from '../dto';

interface UserData {
  userId: number;
}

interface TodoId {
  id?: number;
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
