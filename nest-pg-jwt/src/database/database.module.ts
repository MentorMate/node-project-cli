import { Module, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as pg from 'pg';
import { dbConfig, nodeConfig } from '@utils/environment';
import { KNEX_CONNECTION, NEST_KNEX_OPTIONS } from './constants';
import { NestKnexService } from './nest-knex.service';

@Module({
  providers: [
    NestKnexService,
    {
      provide: NEST_KNEX_OPTIONS,
      inject: [dbConfig.KEY, nodeConfig.KEY],
      useFactory: (
        database: ConfigType<typeof dbConfig>,
        node: ConfigType<typeof nodeConfig>,
      ) => ({
        client: 'pg',
        useNullAsDefault: true,
        connection: {
          host: database.PGHOST,
          port: database.PGPORT,
          user: database.PGUSER,
          password: database.PGPASSWORD,
          database: database.PGDATABASE,
        },
        seeds: {
          directory: `./src/database/seeds/${node.NODE_ENV}`,
        },
      }),
    },
    {
      provide: KNEX_CONNECTION,
      useFactory: async (nestKnexService: NestKnexService) =>
        nestKnexService.connection,
      inject: [NestKnexService],
    },
  ],
  exports: [NestKnexService],
})
export class DatabaseModule implements OnModuleInit, OnApplicationShutdown {
  constructor(private readonly knex: NestKnexService) {}

  onModuleInit() {
    // https://github.com/brianc/node-pg-types/blob/master/lib/builtins.js
    pg.types.setTypeParser(pg.types.builtins.INT8, parseInt);
    pg.types.setTypeParser(pg.types.builtins.NUMERIC, parseFloat);
    pg.types.setTypeParser(pg.types.builtins.DATE, (v) => v); // keep as string for now
  }

  async onApplicationShutdown(): Promise<void> {
    await this.knex.connection.destroy();
  }
}
