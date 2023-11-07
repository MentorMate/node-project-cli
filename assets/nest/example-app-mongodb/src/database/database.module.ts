import { Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { Environment } from '@utils/environment';
import { NEST_MONGO_OPTIONS } from './constants';
import { DatabaseService } from './database.service';

@Module({
  imports: [ConfigModule],
  providers: [
    DatabaseService,
    {
      provide: NEST_MONGO_OPTIONS,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Environment>) => {
        const protocol = configService.get('MONGO_PROTOCOL');
        const host = configService.get('MONGO_HOST');
        const port = configService.get('MONGO_PORT');
        const user = configService.get('MONGO_USER') || '';
        const password = configService.get('MONGO_PASSWORD') || '';
        const databaseName = configService.get('MONGO_DATABASE_NAME');
        const delimiter = user && password ? ':' : '';
        const at = delimiter ? '@' : '';

        const urlString = `${protocol}://${user}${delimiter}${password}${at}${host}:${port}`;

        console.log({ urlString });
        return {
          urlString,
          databaseName,
          clientOptions: {},
          migrationsDir: '../../migrations',
          seedsDir: `./seeds/${configService.get('NODE_ENV')}`,
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
