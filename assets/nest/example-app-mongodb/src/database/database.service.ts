import { Injectable, Inject } from '@nestjs/common';
import { NEST_MONGO_OPTIONS } from './constants';
import { MongoClient, MongoClientOptions, Db, ObjectId } from 'mongodb';

type mongodbFn = (mongodb: Db) => Promise<void>;

@Injectable()
export class DatabaseService {
  public connection: Db;
  public client: MongoClient;
  public migrate: {
    rollback: () => Promise<void>;
    latest: () => Promise<void>;
  };
  public seed: {
    run: () => Promise<ObjectId>;
  };

  constructor(
    @Inject(NEST_MONGO_OPTIONS)
    private _NestMongoOptions: {
      urlString: string;
      databaseName: string;
      clientOptions: MongoClientOptions;
      migrationsDir: string;
      seedsDir: string;
    }
  ) {
    const client = new MongoClient(
      _NestMongoOptions.urlString,
      _NestMongoOptions.clientOptions
    );
    const { migrationsDir, seedsDir, databaseName } = _NestMongoOptions;

    let rollbackMigrationsFn: { rollback: mongodbFn };
    let latestMigrationFn: { latest: mongodbFn };
    let seedDbFn: { seedDb: (mongdb: Db) => Promise<ObjectId> };

    this.connection = client.db(databaseName);
    this.client = client;
    this.migrate = {
      rollback: async () => {
        rollbackMigrationsFn =
          rollbackMigrationsFn || (await import(`${migrationsDir}/rollback`));
        await rollbackMigrationsFn.rollback(this.connection);
      },
      latest: async () => {
        latestMigrationFn =
          latestMigrationFn || (await import(`${migrationsDir}/latest`));
        await latestMigrationFn.latest(this.connection);
      },
    };
    this.seed = {
      run: async () => {
        seedDbFn = seedDbFn || (await import(`${seedsDir}`));
        return await seedDbFn.seedDb(this.connection);
      },
    };
  }
}
