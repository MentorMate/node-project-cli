import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@database/database.module';
import { HealthchecksModule } from '@api/healthchecks/healthchecks.module';
import { AuthModule } from '@api/auth/auth.module';
import { UsersModule } from '@api/users/users.module';
import { TodosModule } from '@api/todos/todos.module';
import { nodeConfig, dbConfig, authConfig } from '@utils/environment';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [nodeConfig, dbConfig, authConfig],
      cache: true,
      ignoreEnvFile: true,
      isGlobal: true,
    }),
    DatabaseModule,
    HealthchecksModule,
    UsersModule,
    AuthModule,
    TodosModule,
  ],
})
export class AppModule {}
