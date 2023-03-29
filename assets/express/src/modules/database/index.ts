import pg from 'pg';

export * from './errors';
export * from './models';
export * from './queries';
export * from './repositories';
export * from './utils';
export * from './client';
export * from './knex-extensions';

export const onInit = () => {
  // https://github.com/brianc/node-pg-types/blob/master/lib/builtins.js
  pg.types.setTypeParser(pg.types.builtins.INT8, parseInt);
  pg.types.setTypeParser(pg.types.builtins.NUMERIC, parseFloat);
  pg.types.setTypeParser(pg.types.builtins.DATE, (v) => v); // keep as string for now
};
