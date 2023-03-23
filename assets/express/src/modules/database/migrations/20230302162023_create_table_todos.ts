import { Knex } from 'knex';
import { createUpdatedAtTriggerSQL, dropUpdatedAtTriggerSQL } from './utils';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('todos', (table) => {
    table.bigIncrements('id');
    table.string('name').notNullable().unique({ indexName: 'unq_todos_name' });
    table.text('note');
    table.timestamps(false, true, true);
    table.timestamp('deletedAt');
  });

  await knex.raw(createUpdatedAtTriggerSQL('todos'));
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(dropUpdatedAtTriggerSQL('todos'));
  await knex.schema.dropTable('todos');
}
