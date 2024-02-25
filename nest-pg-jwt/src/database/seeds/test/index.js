const { createId } = require('@paralleldrive/cuid2');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex('users').del();
  await knex('users').insert([
    // The original password for this hash is 'pass@ord'
    {
      id: createId(),
      email: 'hello@email.com',
      password: '$2b$10$Mxur7NOiTlm22yuldEMZgOCbIV7bxDCcUbBLFbzrJ1MrnIczZB.92', // pragma: allowlist secret
      userId: 'tz4a98xxat96iws9zmbrgj3a',
    },
  ]);

  await knex('todos').insert([
    {
      id: createId(),
      name: 'Laundry 1',
      note: 'Buy detergent 1',
      completed: false,
      userId: 'tz4a98xxat96iws9zmbrgj3a',
    },
    {
      id: createId(),
      name: 'Laundry 2',
      note: 'Buy detergent 2',
      completed: false,
      userId: 'tz4a98xxat96iws9zmbrgj3a',
    },
    {
      id: createId(),
      name: 'Laundry 3',
      note: 'Buy detergent 3',
      completed: true,
      userId: 'tz4a98xxat96iws9zmbrgj3a',
    },
  ]);
};
