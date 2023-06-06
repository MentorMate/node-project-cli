import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HelloWorldModule } from './features/hello-world/hello-world.module';
import { HealthchecksModule } from './features/healthchecks/healthchecks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
    }),
    HelloWorldModule,
    HealthchecksModule,
  ],
})
export class AppModule {}
