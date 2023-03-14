import { Logger } from 'pino';
import Knex from 'knex';

export * from './knex-extensions';

export function initializeKnex(logger: Logger) {
  return Knex({
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
    log: {
      warn: logger.warn.bind(logger),
      error: logger.error.bind(logger),
      debug: logger.debug.bind(logger),
      deprecate: logger.warn.bind(logger),
    },
  });
}
