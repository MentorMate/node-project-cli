import { CreateTodoDto } from '../dto/create-todo.dto';
import { UpdateTodoDto } from '../dto/update-todo.dto';
import { ListTodosQuery } from '../entities/list-todos-query.entity';

interface UserData {
  userId: number;
}

interface TodoId {
  id: number;
}

export interface CreateTodoInput extends UserData {
  createTodoDto: CreateTodoDto;
}

export interface FindAllTodosInput extends UserData {
  query: ListTodosQuery;
}

export interface FindOneTodoInput extends UserData, TodoId {}

export interface UpdateTodoInput extends FindOneTodoInput {
  updateTodoDto: UpdateTodoDto;
}
