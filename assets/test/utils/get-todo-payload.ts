import { BaseTodoAttributes } from '@common/data/models';
import { getRandomNumber } from './get-random-number';

export const getTodoPayload: (completed?: boolean) => BaseTodoAttributes = (
  completed
) => ({
  name: 'Laundry' + getRandomNumber(),
  note: 'Buy detergent' + getRandomNumber(),
  completed: completed ?? false,
});
