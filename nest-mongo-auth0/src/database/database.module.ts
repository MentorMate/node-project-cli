import { Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';

import { NEST_MONGO_OPTIONS } from './constants';
import { DatabaseService } from './database.service';
import { dbConfig } from '@utils/environment';

@Module({
  imports: [ConfigModule],
  providers: [
    DatabaseService,
    {
      provide: NEST_MONGO_OPTIONS,
      inject: [dbConfig.KEY],
      useFactory: (database: ConfigType<typeof dbConfig>) => {
        const protocol = database.MONGO_PROTOCOL;
        const host = database.MONGO_HOST;
        const port = database.MONGO_PORT;
        const user = database.MONGO_USER;
        const password = database.MONGO_PASSWORD;
        const databaseName = database.MONGO_DATABASE_NAME;
        const delimiter = user && password ? ':' : '';
        const at = delimiter ? '@' : '';

        const urlString = `${protocol}://${user}${delimiter}${password}${at}${host}:${port}`;

        return {
          urlString,
          databaseName,
          clientOptions: {},
        };
      },
    },
  ],
  exports: [DatabaseService],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(private readonly mongodb: DatabaseService) {}

  async onApplicationShutdown(): Promise<void> {
    await this.mongodb.client.close();
  }
}
