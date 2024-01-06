import { Tables } from 'knex/types/tables';
import { Sorter } from '@utils/query';

export const sortByName: Sorter<Tables['todos']> = (qb, order) =>
  qb.orderBy('name', order);
