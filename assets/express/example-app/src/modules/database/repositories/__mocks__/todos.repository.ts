import { Paginated } from '@common/query';
import { extractPagination } from '@modules/database/utils';
import { InsertTodo, Todo, UpdateTodo } from '../../models';
import { TodosRepositoryInterface } from '../todos.repository.interface';
import { ListTodosQuery } from '@common/data/models';

export class TodosRepository implements TodosRepositoryInterface {
  private lastId = 0;
  private records: Todo[] = [];

  private nextId() {
    return ++this.lastId;
  }

  async insertOne(input: InsertTodo): Promise<Todo> {
    const record = {
      id: this.nextId(),
      ...input,
      note: input.note ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.records.push(record);

    return record;
  }

  async findById(
    id: Todo['id'],
    userId: Todo['userId']
  ): Promise<Todo | undefined> {
    return this.records.find((r) => r.id === id && r.userId === userId);
  }

  async updateById(
    id: Todo['id'],
    userId: Todo['userId'],
    input: UpdateTodo
  ): Promise<Todo | undefined> {
    const record = await this.findById(id, userId);

    if (!record) {
      return;
    }

    Object.assign(record, input);

    return record;
  }

  async deleteById(id: Todo['id'], userId: Todo['userId']): Promise<number> {
    const record = await this.findById(id, userId);

    if (!record) {
      return 0;
    }

    this.records.splice(this.records.indexOf(record), 1);

    return 1;
  }

  async list(
    userId: Todo['userId'],
    query: ListTodosQuery
  ): Promise<Paginated<Todo>> {
    const { page, items } = extractPagination(query.pagination);

    const records = this.records.filter((r) => r.userId === userId);

    const start = (page - 1) * items;
    const end = start + items;
    const data = records.slice(start, end);

    return {
      data,
      meta: {
        total: records.length,
        page,
        items,
      },
    };
  }
}
