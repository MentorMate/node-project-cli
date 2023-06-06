import { Controller, Get } from '@nestjs/common';

@Controller('/healthz')
export class HealthchecksController {
  @Get('/live')
  live(): string {
    return 'OK';
  }

  @Get('/ready')
  ready(): string {
    return 'OK';
  }
}
