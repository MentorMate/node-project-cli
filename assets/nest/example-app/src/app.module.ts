import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HelloWorldModule } from './api/hello-world/hello-world.module';
import { HealthchecksModule } from './api/healthchecks/healthchecks.module';
import { validateConfig } from './utils/environment';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateConfig,
      cache: true,
      ignoreEnvFile: true,
    }),
    HelloWorldModule,
    HealthchecksModule,
  ],
})
export class AppModule {}
