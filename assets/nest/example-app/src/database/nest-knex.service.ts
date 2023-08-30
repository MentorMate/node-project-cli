import { Injectable, Inject } from '@nestjs/common';
import { NEST_KNEX_OPTIONS } from './constants';
import { knex, Knex } from 'knex';

@Injectable()
export class NestKnexService {
  public connection: any;

  constructor(
    @Inject(NEST_KNEX_OPTIONS) private _NestKnexOptions: Knex.Config,
  ) {
    this.connection = knex(this._NestKnexOptions);
  }
}
