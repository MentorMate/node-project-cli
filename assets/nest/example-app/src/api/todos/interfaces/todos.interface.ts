import { CreateTodoDto } from '../dto/create-todo.dto';
import { FindAllTodosQueryDTO } from '../dto/find-all-todos-query.dto';
import { UpdateTodoDto } from '../dto/update-todo.dto';

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
  query: FindAllTodosQueryDTO;
}

export interface FindOneTodoInput extends UserData, TodoId {}

export interface UpdateTodoInput extends FindOneTodoInput {
  updateTodoDto: UpdateTodoDto;
}
