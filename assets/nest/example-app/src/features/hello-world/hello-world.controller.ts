import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Hello World')
@Controller()
export class HelloWorldController {
  @Get()
  @ApiOperation({
    summary: 'Hello, World!',
    description: 'Says "Hello, World!"',
  })
  @ApiOkResponse({
    description: 'Says hi.',
    content: {
      'text/plain': {
        schema: {
          type: 'string',
          example: 'Hello, World!',
        },
      },
    },
  })
  getHello(): string {
    return 'Hello, World!';
  }
}
