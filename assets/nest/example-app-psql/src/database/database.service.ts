import { Injectable, Inject } from '@nestjs/common';
import { NEST_KNEX_OPTIONS } from './constants';
import { knex, Knex } from 'knex';

@Injectable()
export class DatabaseService {
  public connection: Knex;
  public migrate: Knex.Migrator;
  public seed: Knex.Seeder;

  constructor(
    @Inject(NEST_KNEX_OPTIONS) private _NestKnexOptions: Knex.Config
  ) {
    const knexConnection = knex(this._NestKnexOptions);

    this.connection = knexConnection;
    this.migrate = knexConnection.migrate;
    this.seed = knexConnection.seed;
  }
}
