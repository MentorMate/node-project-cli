import { Test } from '@nestjs/testing';
import { NestKnexService } from '@database/nest-knex.service';
import { BaseRepository } from './base-repository.repository';
import { Knex } from 'knex';
import { SortOrder } from '@utils/query';

describe('BaseRepository', () => {
  let baseRepository: BaseRepository<object>;

  const where = jest.fn((): Promise<void> => Promise.resolve());
  const whereILike = jest.fn((): Promise<void> => Promise.resolve());
  const orderBy = jest.fn((): Promise<void> => Promise.resolve());
  const first = jest.fn((): Promise<unknown> => Promise.resolve());

  const count = jest.fn().mockImplementation(() => ({
    first,
  }));

  const clone = jest.fn().mockImplementation(() => ({
    count,
  }));

  const qb = {
    where,
    whereILike,
    orderBy,
    clone,
  } as unknown as Knex.QueryBuilder<object>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: NestKnexService,
          useFactory: () => ({
            repository: () => ({
              qb,
            }),
          }),
        },
        BaseRepository,
      ],
    }).compile();

    baseRepository = moduleRef.get<BaseRepository<object>>(BaseRepository);
  });

  it('where', async () => {
    await baseRepository.where(qb, 'testName' as any, 'name');

    expect(where).toHaveBeenCalled();
    expect(where).toHaveBeenCalledWith({ ['name']: 'testName' });
  });

  it('whereLike', async () => {
    await baseRepository.whereLike(qb, 'testName' as any, 'name');

    expect(whereILike).toHaveBeenCalled();
    expect(whereILike).toHaveBeenCalledWith('name', `%testName%`);
  });

  it('orderBy', async () => {
    await baseRepository.orderBy(qb, SortOrder.Asc, 'name');

    expect(orderBy).toHaveBeenCalled();
    expect(orderBy).toHaveBeenCalledWith('name', SortOrder.Asc);
  });

  it('count', async () => {
    first.mockResolvedValueOnce({ count: 1 });

    const result = await baseRepository.count(qb);

    expect(result).toBe(1);
  });
});
