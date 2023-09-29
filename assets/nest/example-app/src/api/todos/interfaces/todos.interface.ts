import { CreateTodoDto } from '../dto/create-todo.dto';
import { FindAllTodosQueryDto } from '../dto/find-all-todos-query.dto';
import { UpdateTodoDto } from '../dto/update-todo.dto';

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
