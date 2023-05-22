import pgtools, { PgtoolsError } from 'pgtools';
import { PostgresError } from 'pg-error-enum';
import { environmentSchema } from '@utils/environment';

const env = environmentSchema.parse(process.env);

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
  await pgtools.dropdb(config, env.PGDATABASE).catch(handleDbDoesNotExist);
  console.log(`Creating database: ${env.PGDATABASE}`);
  await pgtools.createdb(config, env.PGDATABASE);
  console.log('Done');
};

recreate().catch(console.error);
