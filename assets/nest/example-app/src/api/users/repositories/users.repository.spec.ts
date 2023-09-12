import { UsersRepository } from './users.repository';
import { Test } from '@nestjs/testing';
import { NestKnexService } from '@database/nest-knex.service';
import { InsertUser } from '../entities';
import {
  mockKnexService,
  returning,
  insert,
  first,
  where,
} from '../../../utils/test/knex';

describe('UsersRepository', () => {
  let usersRepository: UsersRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: NestKnexService,
          useFactory: () => mockKnexService,
        },
        UsersRepository,
      ],
    }).compile();

    usersRepository = moduleRef.get<UsersRepository>(UsersRepository);
  });

  it('insertOne - create a user', async () => {
    const insertUser: InsertUser = {
      email: 'user@example.com',
      password: 'password',
    };

    const createdUser = {
      id: 1,
      email: 'user@example.com',
      password: 'password',
    };

    returning.mockImplementationOnce(() => Promise.resolve([createdUser]));

    const result = await usersRepository.insertOne(insertUser);

    expect(result).toBe(createdUser);
    expect(insert).toHaveBeenCalledWith(insertUser);
  });

  it('findByEmail - find a user', async () => {
    const userFound = {
      id: 1,
      email: 'user@example.com',
      password: 'password',
    };

    first.mockImplementationOnce(() => Promise.resolve(userFound));

    const result = await usersRepository.findByEmail('user@example.com');

    expect(result).toBe(userFound);
    expect(where).toHaveBeenCalledWith({ email: 'user@example.com' });
  });
});
