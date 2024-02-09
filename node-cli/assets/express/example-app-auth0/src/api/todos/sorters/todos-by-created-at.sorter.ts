import { Tables } from 'knex/types/tables';
import { Sorter } from '@utils/query';

export const sortByCreatedAt: Sorter<Tables['todos']> = (qb, order) =>
  qb.orderBy('createdAt', order);
