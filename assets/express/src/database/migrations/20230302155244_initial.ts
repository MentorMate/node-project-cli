import { Knex } from 'knex';
import { createUpdateTimestampsFunctionSQL } from '../migration-utils';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(createUpdateTimestampsFunctionSQL);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP FUNCTION IF EXISTS update_timestamp() CASCADE;');
}
