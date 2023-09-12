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
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Todo } from './entities/todo.entity';
import { ListTodosQuery } from './entities/list-todos-query.entity';

@ApiTags('Todos')
@Controller('v1/todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @ApiCreatedResponse({ type: Todo })
  @ApiBody({ type: CreateTodoDto })
  @Post()
  create(
    @Body() createTodoDto: CreateTodoDto,
    @Req() { user: { sub } }: UserData,
  ) {
    return this.todosService.create({ createTodoDto, userId: Number(sub) });
  }

  @ApiOkResponse({ type: Todo, isArray: true })
  @Get()
  findAll(@Req() { user: { sub } }: UserData, @Query() query: ListTodosQuery) {
    return this.todosService.findAll({ userId: Number(sub), query });
  }

  @ApiOkResponse({ type: Todo })
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() { user: { sub } }: UserData,
  ) {
    return this.todosService.findOne({ id, userId: Number(sub) });
  }

  @ApiOkResponse({ type: Todo })
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() { user: { sub } }: UserData,
    @Body() updateTodoDto: UpdateTodoDto,
  ) {
    return this.todosService.update({ id, userId: Number(sub), updateTodoDto });
  }

  @ApiOkResponse({ type: Number })
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() { user: { sub } }: UserData,
  ) {
    return this.todosService.remove({ id, userId: Number(sub) });
  }
}
