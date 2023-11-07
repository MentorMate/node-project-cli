const { MongoClient, MongoClientOptions } = require('mongodb');
const MONGO_URL = 'mongodb://user:password@localhost:27017/';

const mongoConnection = new MongoClient(MONGO_URL);

async function test() {
  try {
    const ins = mongoConnection
      .db()
      .collection('testme')
      .insertOne(
        {
          test: 'me',
        },
        (err, res) => {
          console.log({ res });
        }
      );
    // console.log({ ins });
    // mongoConnection.close();
  } catch (err) {
    console.log({ err });
  }
}

test();
