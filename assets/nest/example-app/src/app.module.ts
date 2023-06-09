import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateConfig } from '@utils/environment';
import { DatabaseModule } from '@database/database.module';
import { HelloWorldModule } from '@hello-world/hello-world.module';
import { HealthchecksModule } from '@healthchecks/healthchecks.module';
import { AuthModule } from '@auth/auth.module';
import { UsersModule } from '@users/users.module';
import { TodosModule } from '@todos/todos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateConfig,
      cache: true,
      ignoreEnvFile: true,
    }),
    DatabaseModule,
    HelloWorldModule,
    HealthchecksModule,
    UsersModule,
    AuthModule,
    TodosModule,
  ],
})
export class AppModule {}
