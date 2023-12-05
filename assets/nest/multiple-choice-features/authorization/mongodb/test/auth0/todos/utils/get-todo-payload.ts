import { CreateTodoDto } from '@api/todos/dto/create-todo.dto';

export const getTodoPayload: (completed?: boolean) => CreateTodoDto = (
  completed
) => ({
  name: 'Laundry' + Date.now(),
  note: 'Buy detergent' + Date.now(),
  completed: completed ?? false,
});
