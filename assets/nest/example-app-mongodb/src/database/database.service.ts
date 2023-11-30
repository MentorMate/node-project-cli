import { Injectable, Inject } from '@nestjs/common';
import { NEST_MONGO_OPTIONS } from './constants';
import { MongoClient, MongoClientOptions, Db } from 'mongodb';

@Injectable()
export class DatabaseService {
  public connection: Db;
  public client: MongoClient;

  constructor(
    @Inject(NEST_MONGO_OPTIONS)
    private _NestMongoOptions: {
      urlString: string;
      databaseName: string;
      clientOptions: MongoClientOptions;
    }
  ) {
    const client = new MongoClient(
      _NestMongoOptions.urlString,
      _NestMongoOptions.clientOptions
    );
    const { databaseName } = _NestMongoOptions;

    this.connection = client.db(databaseName);
    this.client = client;
  }
}
