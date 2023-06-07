import 'reflect-metadata';
import { dropdb, createdb, PgtoolsError } from 'pgtools';
import { PostgresError } from 'pg-error-enum';
import { validateConfig } from '../../src/utils/environment';

const env = validateConfig(process.env);

const config = {
  user: env.PGUSER,
  password: env.PGPASSWORD,
  port: env.PGPORT,
  host: env.PGHOST,
};

const handleDbDoesNotExist = (e: PgtoolsError) => {
  if (e.cause.code !== PostgresError.INVALID_CATALOG_NAME) {
    throw e;
  }

  console.log(`Database doesn't exist: ${env.PGDATABASE}`);
};

const recreate = async () => {
  console.log(`Dropping database: ${env.PGDATABASE}`);
  await dropdb(config, env.PGDATABASE).catch(handleDbDoesNotExist);
  console.log(`Creating database: ${env.PGDATABASE}`);
  await createdb(config, env.PGDATABASE);
  console.log('Done');
};

recreate().catch(console.error);
