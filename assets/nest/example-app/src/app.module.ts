import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateConfig } from '@utils/environment';
import { DatabaseModule } from '@database/database.module';
import { HealthchecksModule } from '@api/healthchecks/healthchecks.module';
import { AuthModule } from '@api/auth/auth.module';
import { UsersModule } from '@api/users/users.module';
import { TodosModule } from '@api/todos/todos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateConfig,
      cache: true,
      ignoreEnvFile: true,
    }),
    DatabaseModule,
    HealthchecksModule,
    UsersModule,
    AuthModule,
    TodosModule,
  ],
})
export class AppModule {}
