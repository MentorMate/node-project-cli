import { Tables } from 'knex/types/tables';
import { Sorter } from '../query-builder/extensions';

export const sortByName: Sorter<Tables['todos']> = (qb, order) =>
  qb.orderBy('name', order);

export const sortByCreatedAt: Sorter<Tables['todos']> = (qb, order) =>
  qb.orderBy('createdAt', order);
