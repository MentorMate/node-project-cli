/**
 * @param mongodb { import("mongodb").Db } knex
 * @returns { Promise<void> }
 */
async function seedDb(mongodb) {
  await mongodb.collection('users').deleteMany();
  await mongodb.collection('users').insertOne(
    // The original password for this hash is 'pass@ord'
    {
      email: 'hello@email.com',
      password: '$2b$10$Mxur7NOiTlm22yuldEMZgOCbIV7bxDCcUbBLFbzrJ1MrnIczZB.92', // pragma: allowlist secret
      userId: 'tz4a98xxat96iws9zmbrgj3a',
    }
  );
  await mongodb.collection('todos').deleteMany();
  await mongodb.collection('todos').insertMany([
    {
      name: 'Laundry 1',
      note: 'Buy detergent 1',
      completed: false,
      userId: 'tz4a98xxat96iws9zmbrgj3a',
    },
    {
      name: 'Laundry 2',
      note: 'Buy detergent 2',
      completed: false,
      userId: 'tz4a98xxat96iws9zmbrgj3a',
    },
    {
      name: 'Laundry 3',
      note: 'Buy detergent 3',
      completed: true,
      userId: 'tz4a98xxat96iws9zmbrgj3a',
    },
  ]);
}

module.exports = { seedDb };
