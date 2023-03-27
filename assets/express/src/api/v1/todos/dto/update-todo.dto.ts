import { todoAttributes } from '@common/data/models';

export const updateTodoDTO = todoAttributes
  .omit({
    userId: true,
  })
  .partial();
