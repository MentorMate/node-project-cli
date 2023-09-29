import { Module } from '@nestjs/common';
import { TodosController } from './todos.controller';

export const todosModuleMetadata = {
  controllers: [TodosController],
};

@Module(todosModuleMetadata)
export class TodosModule {}
