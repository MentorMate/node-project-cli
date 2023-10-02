import { Module, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as pg from 'pg';

import { Environment } from '@utils/environment';
import { KNEX_CONNECTION, NEST_KNEX_OPTIONS } from './constants';
import { NestKnexService } from './nest-knex.service';

@Module({
  imports: [ConfigModule],
  providers: [
    NestKnexService,
    {
      provide: NEST_KNEX_OPTIONS,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Environment>) => ({
        client: 'pg',
        useNullAsDefault: true,
        connection: {
          host: configService.get('PGHOST'),
          port: configService.get('PGPORT'),
          user: configService.get('PGUSER'),
          password: configService.get('PGPASSWORD'),
          database: configService.get('PGDATABASE'),
        },
        seeds: {
          directory: `./src/database/seeds/${configService.get('NODE_ENV')}`
        }
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
