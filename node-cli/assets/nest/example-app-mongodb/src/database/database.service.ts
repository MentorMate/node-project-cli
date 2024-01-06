import { Injectable, Inject } from '@nestjs/common';
import { NEST_MONGO_OPTIONS } from './constants';
import { MongoClient, MongoClientOptions, Db } from 'mongodb';

@Injectable()
export class DatabaseService {
  public connection: Db;
  public client: MongoClient;

  constructor(
    @Inject(NEST_MONGO_OPTIONS)
    nestMongoOptions: {
      urlString: string;
      databaseName: string;
      clientOptions: MongoClientOptions;
    },
  ) {
    const client = new MongoClient(
      nestMongoOptions.urlString,
      nestMongoOptions.clientOptions,
    );
    const { databaseName } = nestMongoOptions;

    this.connection = client.db(databaseName);
    this.client = client;
  }
}
