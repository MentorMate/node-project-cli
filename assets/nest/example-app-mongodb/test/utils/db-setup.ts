import { Collections } from '@database/constants';
import { Db, ObjectId } from 'mongodb';

export class MongoDBTestSetup {
  public readonly userId: ObjectId;

  constructor(private readonly mongodb: Db) {
    this.userId = new ObjectId();
    this.mongodb = mongodb;
  }

  async seedData() {
    await this.mongodb.createCollection(Collections.Users);
    await this.mongodb.createCollection(Collections.Todos);
    await this.mongodb.createIndex(Collections.Todos, 'user_id');
    await seedDb(this.mongodb, this.userId);
  }

  async removeSeededData() {
    await this.mongodb.dropCollection(Collections.Todos);
    await this.mongodb.dropCollection(Collections.Users);
  }
}

async function seedDb(mongodb: Db, userId: ObjectId) {
  await mongodb.collection('users').deleteMany();
  await mongodb.collection('users').insertOne(
    // The original password for this hash is 'pass@ord'
    {
      email: 'hello@email.com',
      password: '$2b$10$Mxur7NOiTlm22yuldEMZgOCbIV7bxDCcUbBLFbzrJ1MrnIczZB.92', // pragma: allowlist secret
      userId,
    }
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
}
