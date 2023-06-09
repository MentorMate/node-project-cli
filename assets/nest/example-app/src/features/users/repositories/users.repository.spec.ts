import Knex from 'knex';
import { DatabaseError } from 'pg';
import { PostgresError } from 'pg-error-enum';
import { DuplicateRecordError } from '@database/errors';
import { User } from '../entities/user.entity';
import { UsersRepository } from './users.repository';

describe('UsersRepository', () => {
  const knex = Knex({ client: 'pg', connection: {} });
  const users = new UsersRepository(knex);
  const usersQb = knex('users');

  describe('insertOne', () => {
    it('should return the newly created record', async () => {
      const user = { email: 'email@example.com', password: '123' };

      jest.spyOn(usersQb, 'insert');
      jest.spyOn(usersQb, 'returning');
      jest.spyOn(usersQb, 'then');
      jest.spyOn(usersQb, 'catch').mockImplementationOnce(async () => ({
        id: 1,
        ...user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      const result = await users.insertOne(user);

      expect(usersQb.insert).toHaveBeenCalledWith(user);
      expect(usersQb.returning).toHaveBeenCalledWith('*');
      expect(usersQb.then).toHaveBeenCalled();
      expect(usersQb.catch).toHaveBeenCalled();

      expect(result).toEqual(expect.objectContaining(user));
    });

    it('should rethrow email uniq constraint violation as duplicate record', () => {
      const error = new DatabaseError('unique violation', 72, 'error');
      error.code = PostgresError.UNIQUE_VIOLATION;
      error.constraint = 'unq_users_email';
      const thenable = () => ({ then: () => Promise.reject(error) });

      jest
        .spyOn(usersQb, 'returning')
        .mockImplementationOnce(thenable as never);

      expect(
        users.insertOne({ email: 'email@example.com', password: '123' }),
      ).rejects.toThrowError(
        new DuplicateRecordError('User email already taken'),
      );
    });
  });

  describe('findByEmail', () => {
    it('should return the first record found', async () => {
      const user: User = {
        id: 1,
        email: 'email@example.com',
        password: '123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      jest.spyOn(usersQb, 'where');
      jest
        .spyOn(usersQb, 'first')
        .mockImplementationOnce(() => Promise.resolve(user) as never);

      const result = await users.findByEmail(user.email);

      expect(usersQb.where).toHaveBeenCalledWith({ email: user.email });
      expect(usersQb.first).toHaveBeenCalled();

      expect(result).toEqual(user);
    });
  });
});
