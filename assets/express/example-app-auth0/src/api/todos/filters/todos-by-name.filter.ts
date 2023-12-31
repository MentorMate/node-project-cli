import { Tables } from 'knex/types/tables';
import { Filter } from '@utils/query';

export const filterByName: Filter<Tables['todos'], string> = (qb, name) =>
  qb.whereILike('name', `%${name}%`);
