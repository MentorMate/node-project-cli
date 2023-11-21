import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  Put,
  Query,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Todo } from './entities';
import { Paginated } from '@utils/query';
import { CreateTodoDto, FindAllTodosQueryDto, UpdateTodoDto } from './dto';
import { UserData } from '@api/auth/interfaces';
import {
  BadRequestDto,
  NotFoundDto,
  UnprocessableEntityDto,
} from '@utils/dtos';
import { Errors } from '@utils/enums';
import { ObjectId } from 'mongodb';
import { NullableKeysPartial } from '@utils/interfaces';
import { GenericEntity } from '@utils/entities';
import { toObjectIdPipe } from '@utils/pipes';

@ApiTags('Todos')
@Controller('v1/todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @ApiBody({ type: CreateTodoDto })
  @ApiCreatedResponse({ type: Todo })
  @ApiBadRequestResponse({
    type: BadRequestDto,
    description: Errors.BadRequest,
  })
  @ApiNotFoundResponse({ type: NotFoundDto, description: Errors.NotFound })
  @ApiUnprocessableEntityResponse({
    type: UnprocessableEntityDto,
    description: Errors.UnprocessableEntity,
  })
  @Post()
  create(
    @Body() createTodoDto: CreateTodoDto,
    @Req() { user: { sub } }: UserData
  ): Promise<ObjectId> {
    return this.todosService.create({ createTodoDto, userId: sub });
  }

  @ApiOkResponse({ type: Todo, isArray: true })
  @ApiBadRequestResponse({
    type: BadRequestDto,
    description: Errors.BadRequest,
  })
  @Get()
  findAll(
    @Req() { user: { sub } }: UserData,
    @Query() query: FindAllTodosQueryDto
  ): Promise<Paginated<NullableKeysPartial<Todo>>> {
    return this.todosService.findAll({ userId: sub, query });
  }

  @ApiOkResponse({ type: Todo })
  @ApiNotFoundResponse({ type: NotFoundDto, description: Errors.NotFound })
  @Get(':id')
  findOne(
    @Param('id', toObjectIdPipe) _id: ObjectId,
    @Req() { user: { sub } }: UserData
  ): Promise<NullableKeysPartial<Todo>> {
    return this.todosService.findOneOrFail({ _id, userId: sub });
  }

  @ApiBody({ type: UpdateTodoDto })
  @ApiOkResponse({ type: Todo })
  @ApiBadRequestResponse({
    type: BadRequestDto,
    description: Errors.BadRequest,
  })
  @ApiNotFoundResponse({ type: NotFoundDto, description: Errors.NotFound })
  @Put(':id')
  async update(
    @Param('id', toObjectIdPipe) _id: ObjectId,
    @Req() { user: { sub } }: UserData,
    @Body() updateTodoDto: UpdateTodoDto
  ): Promise<NullableKeysPartial<Todo>> {
    return await this.todosService.update({ _id, userId: sub, updateTodoDto });
  }

  @ApiOkResponse({ type: Number })
  @ApiNotFoundResponse({ type: NotFoundDto, description: Errors.NotFound })
  @Delete(':id')
  remove(
    @Param('id', toObjectIdPipe) _id: GenericEntity['_id'],
    @Req() { user: { sub } }: UserData
  ): Promise<boolean> {
    return this.todosService.remove({ _id, userId: sub });
  }
}
