import { BaseTodoAttributes } from '@common/data/models';

export const getTodoPayload: (completed?: boolean) => BaseTodoAttributes = (
  completed
) => ({
  name: 'Laundry' + Date.now(),
  note: 'Buy detergent' + Date.now(),
  completed: completed ?? false,
});
