import { Module } from '@nestjs/common';
import { HealthchecksController } from './healthchecks.controller';

@Module({
  controllers: [HealthchecksController],
})
export class HealthchecksModule {}
