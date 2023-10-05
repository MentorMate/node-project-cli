/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('users').del();
  await knex('users').insert([
    // The original password for this hash is 'pass@ord'
    {
      email: 'hello@email.com',
      password: '$2b$10$Mxur7NOiTlm22yuldEMZgOCbIV7bxDCcUbBLFbzrJ1MrnIczZB.92', // pragma: allowlist secret
    },
  ]);

  await knex('todos').insert([
    {
      name: 'Laundry 1',
      note: 'Buy detergent 1',
      completed: false,
      userId: 1,
    },
    {
      name: 'Laundry 2',
      note: 'Buy detergent 2',
      completed: false,
      userId: 1,
    },
    {
      name: 'Laundry 3',
      note: 'Buy detergent 3',
      completed: true,
      userId: 1,
    },
  ]);
};
