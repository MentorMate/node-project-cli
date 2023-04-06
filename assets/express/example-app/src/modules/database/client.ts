import Knex, { Knex as TKnex } from 'knex';

export const create = () =>
  Knex({
    client: 'pg',
    // We don't need to specify the connection options as we're using the default env var names
    // see https://node-postgres.com/features/connecting#environment-variables
    // see https://www.postgresql.org/docs/9.1/libpq-envars.html
    connection: {},
    pool: {
      // the minimum is for all connections rather than alive, so it has to be set to zero
      // see https://knexjs.org/guide/#pool
      min: 0,
    },
  });

export const destroy = (knex: TKnex) => knex.destroy();
