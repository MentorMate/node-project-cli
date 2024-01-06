import { ObjectId } from 'mongodb';
import { CreateTodoDto, FindAllTodosQueryDto, UpdateTodoDto } from '../dto';

interface UserData {
  userId: ObjectId;
}

interface TodoId {
  _id?: ObjectId;
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
