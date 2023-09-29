import { Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('v1', 'Todo')
@Controller('/v1/todos')
export class TodosController {
  @Post()
  @ApiOperation({
    summary: 'Create a To-Do',
    description: 'Create a new To-Do item',
  })
  @ApiUnauthorizedResponse()
  @ApiUnprocessableEntityResponse()
  create() {
    return 'OK';
  }

  @Get()
  @ApiOperation({
    summary: 'List To-Dos',
    description: 'List To-Do items',
  })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  list() {
    return 'OK';
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a To-Do',
    description: 'Get a To-Do item',
  })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  @ApiUnprocessableEntityResponse()
  get() {
    return 'OK';
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a To-Do',
    description: 'Update a To-Do item',
  })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  @ApiUnprocessableEntityResponse()
  update() {
    return 'OK';
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Login a user',
    description: 'Authenticate a user',
  })
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  @ApiUnprocessableEntityResponse()
  delete() {
    return 'OK';
  }
}
