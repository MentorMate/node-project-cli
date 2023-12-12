import { UsersRepository } from './users.repository';
import { Test } from '@nestjs/testing';
import { DatabaseService } from '@database/database.service';
import { ObjectId } from 'mongodb';

describe('UsersRepository', () => {
  let usersRepository: UsersRepository;

  const mockFn = jest.fn().mockImplementation(() => Promise.resolve([]));

  const insertOne = jest.fn().mockImplementation(async () => mockFn());
  const findOne = jest.fn().mockImplementation(() => mockFn());
  const findOneAndUpdate = jest.fn().mockImplementation(() => mockFn());
  const findOneAndDelete = jest.fn().mockImplementation(() => mockFn());

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: DatabaseService,
          useFactory: () => ({
            connection: {
              collection: () => ({
                insertOne,
                findOne,
                findOneAndUpdate,
                findOneAndDelete,
              }),
            },
          }),
        },
        UsersRepository,
      ],
    }).compile();

    usersRepository = moduleRef.get<UsersRepository>(UsersRepository);
  });

  it('insertOne - create a user', async () => {
    const insertUser = {
      email: 'user@example.com',
      userId: 'auth0-user-id',
    };

    const createdUser = {
      _id: new ObjectId(100),
      email: 'user@example.com',
      userId: 'auth0-user-id',
    };

    mockFn.mockImplementationOnce(() =>
      Promise.resolve({ insertedId: createdUser._id }),
    );

    const result = await usersRepository.insertOne({
      email: insertUser.email,
      userId: insertUser.userId,
    });

    expect(result).toBe(createdUser._id);
    expect(insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        email: insertUser.email,
        userId: insertUser.userId,
      }),
    );
  });

  it('findByEmail - find a user', async () => {
    const userFound = {
      id: 1,
      email: 'user@example.com',
      password: 'password',
    };

    mockFn.mockImplementationOnce(() => Promise.resolve(userFound));

    const result = await usersRepository.findByEmail('user@example.com');

    expect(result).toBe(userFound);
    expect(findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
  });
});
