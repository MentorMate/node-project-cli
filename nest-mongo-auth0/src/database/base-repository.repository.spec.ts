import { Test } from '@nestjs/testing';
import { BaseRepository } from './base-repository.repository';
import { DatabaseService } from './database.service';

describe('BaseRepository', () => {
  let baseRepository: BaseRepository<object>;

  const estimatedDocumentCount = jest.fn(
    (): Promise<unknown> => Promise.resolve(),
  );

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: DatabaseService,
          useFactory: () => ({
            connection: {
              collection: () => ({
                estimatedDocumentCount,
              }),
            },
          }),
        },
        BaseRepository,
      ],
    }).compile();

    const databaseService = moduleRef.get(DatabaseService);
    baseRepository = new BaseRepository(databaseService, 'test');
  });

  it('count', async () => {
    estimatedDocumentCount.mockResolvedValueOnce(1);

    const result = await baseRepository.count();

    expect(result).toBe(1);
  });
});
