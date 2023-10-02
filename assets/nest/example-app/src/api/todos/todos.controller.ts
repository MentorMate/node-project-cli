import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  ParseIntPipe,
  Put,
  Query,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { UserData } from '@api/auth/entities';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { Todo } from './entities/todo.entity';
import { Paginated } from '@utils/query/pagination';
import { BadRequestDto, Errors, NotFoundDto } from '@utils/api/response';
import { FindAllTodosQueryDto } from './dto/find-all-todos-query.dto';

@ApiTags('Todos')
@Controller('v1/todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) { }

  @ApiBody({ type: CreateTodoDto })
  @ApiCreatedResponse({ type: Todo })
  @ApiBadRequestResponse({
    type: BadRequestDto,
    description: Errors.BadRequest,
  })
  @ApiNotFoundResponse({ type: NotFoundDto, description: Errors.NotFound })
  @Post()
  create(
    @Body() createTodoDto: CreateTodoDto,
    @Req() { user: { sub } }: UserData,
  ): Promise<Todo> {
    return this.todosService.create({ createTodoDto, userId: sub });
  }

  @ApiOkResponse({ type: Todo, isArray: true })
  @ApiBadRequestResponse({
    type: BadRequestDto,
    description: Errors.BadRequest,
  })
  @ApiQuery({ name: 'Filters', type: FindAllTodosQueryDto, required: false })
  @Get()
  findAll(
    @Req() { user: { sub } }: UserData,
    @Query() query: FindAllTodosQueryDto,
  ): Promise<Paginated<Todo>> {
    return this.todosService.findAll({ userId: sub, query });
  }

  @ApiOkResponse({ type: Todo })
  @ApiNotFoundResponse({ type: NotFoundDto, description: Errors.NotFound })
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() { user: { sub } }: UserData,
  ): Promise<Todo> {
    return this.todosService.findOneOrFail({ id, userId: sub });
  }

  @ApiBody({ type: UpdateTodoDto })
  @ApiOkResponse({ type: Todo })
  @ApiBadRequestResponse({
    type: BadRequestDto,
    description: Errors.BadRequest,
  })
  @ApiNotFoundResponse({ type: NotFoundDto, description: Errors.NotFound })
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() { user: { sub } }: UserData,
    @Body() updateTodoDto: UpdateTodoDto,
  ): Promise<Todo> {
    return this.todosService.update({ id, userId: sub, updateTodoDto });
  }

  @ApiOkResponse({ type: Number })
  @ApiNotFoundResponse({ type: NotFoundDto, description: Errors.NotFound })
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() { user: { sub } }: UserData,
  ): Promise<number> {
    return this.todosService.remove({ id, userId: sub });
  }
}
