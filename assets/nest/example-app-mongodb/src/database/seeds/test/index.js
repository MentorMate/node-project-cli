/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-empty-function */
const { ObjectId } = require('mongodb');

/**
 * @param mongodb { import("mongodb").Db } mongodb
 * @returns { Promise<void> }
 */
async function seedDb(mongodb) {
  const userId = new ObjectId();
  await mongodb.collection('users').deleteMany();
  await mongodb.collection('users').insertOne(
    // The original password for this hash is 'pass@ord'
    {
      email: 'hello@email.com',
      password: '$2b$10$Mxur7NOiTlm22yuldEMZgOCbIV7bxDCcUbBLFbzrJ1MrnIczZB.92', // pragma: allowlist secret
      userId,
    },
  );
  await mongodb.collection('todos').deleteMany();
  await mongodb.collection('todos').insertMany([
    {
      name: 'Laundry 1',
      note: 'Buy detergent 1',
      completed: false,
      userId,
    },
    {
      name: 'Laundry 2',
      note: 'Buy detergent 2',
      completed: false,
      userId,
    },
    {
      name: 'Laundry 3',
      note: 'Buy detergent 3',
      completed: true,
      userId,
    },
  ]);

  return userId;
}

module.exports = { seedDb };
