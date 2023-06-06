import { Controller, Get } from '@nestjs/common';

@Controller()
export class HelloWorldController {
  @Get()
  getHello(): string {
    return 'Hello, World!';
  }
}
