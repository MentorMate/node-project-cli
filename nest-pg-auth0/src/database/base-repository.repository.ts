import { NestKnexService } from '@database/nest-knex.service';
import { SortOrder } from '@utils/query';
import { Knex } from 'knex';

export class BaseRepository<Entity extends object> {
  private knexService;

  constructor(knex: NestKnexService, private readonly tableName: string) {
    this.knexService = knex;
  }

  repository() {
    return this.knexService.connection<Entity>(this.tableName);
  }

  async count(qb: Knex.QueryBuilder<Entity>): Promise<number> {
    const totalCount = await qb.clone().count().first();

    return +totalCount.count;
  }

  where(qb: Knex.QueryBuilder<Entity>, value: Partial<Entity>, column: string) {
    return qb.where({ [column]: value });
  }

  whereLike(
    qb: Knex.QueryBuilder<Entity>,
    value: Partial<Entity>,
    column: string,
  ) {
    return qb.whereILike(column, `%${value}%`);
  }

  orderBy(qb: Knex.QueryBuilder<Entity>, order: SortOrder, column: string) {
    return qb.orderBy(column, order);
  }
}
