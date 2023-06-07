import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Healthchecks')
@Controller('/healthz')
export class HealthchecksController {
  @Get('/live')
  @ApiOperation({
    summary: 'Liveness endpoint',
    description: 'Used to check whether the application is alive.',
  })
  @ApiOkResponse({
    description: 'Application is alive',
    content: {
      'text/plain': {
        schema: {
          type: 'string',
          example: 'OK',
        },
      },
    },
  })
  live(): string {
    return 'OK';
  }

  @Get('/ready')
  @ApiOperation({
    summary: 'Readiness endpoint',
    description:
      'Used to check whether the application is ready to receive requests.',
  })
  @ApiOkResponse({
    description: 'Application is ready',
    content: {
      'text/plain': {
        schema: {
          type: 'string',
          example: 'OK',
        },
      },
    },
  })
  ready(): string {
    return 'OK';
  }
}
