import { Tables } from 'knex/types/tables';
import { Filter } from '@utils/query';

export const filterByCompleted: Filter<Tables['todos'], boolean> = (
  qb,
  completed
) => qb.where({ completed });
