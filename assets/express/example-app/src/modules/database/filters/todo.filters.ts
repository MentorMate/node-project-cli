import { Tables } from 'knex/types/tables';
import { Filter } from '../query-builder';

export const filterByName: Filter<Tables['todos'], string> = (qb, name) =>
  qb.whereILike('name', `%${name}%`);

export const filterByCompleted: Filter<Tables['todos'], boolean> = (
  qb,
  completed
) => qb.where({ completed });
