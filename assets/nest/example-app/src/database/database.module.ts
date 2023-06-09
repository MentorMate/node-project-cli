import { Module, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InjectKnex, Knex, KnexModule } from 'nestjs-knex';
import * as pg from 'pg';

import { Environment } from '@utils/environment';

@Module({
  imports: [
    KnexModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Environment>) => ({
        config: {
          client: 'pg',
          useNullAsDefault: true,
          connection: {
            host: configService.get('PGHOST'),
            port: configService.get('PGPORT'),
            user: configService.get('PGUSER'),
            password: configService.get('PGPASSWORD'),
            database: configService.get('PGDATABASE'),
          },
        },
      }),
    }),
  ],
})
export class DatabaseModule implements OnModuleInit, OnApplicationShutdown {
  constructor(@InjectKnex() private readonly knex: Knex) {}

  onModuleInit() {
    // https://github.com/brianc/node-pg-types/blob/master/lib/builtins.js
    pg.types.setTypeParser(pg.types.builtins.INT8, parseInt);
    pg.types.setTypeParser(pg.types.builtins.NUMERIC, parseFloat);
    pg.types.setTypeParser(pg.types.builtins.DATE, (v) => v); // keep as string for now
  }

  async onApplicationShutdown(): Promise<void> {
    await this.knex.destroy();
  }
}
