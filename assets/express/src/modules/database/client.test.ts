import Knex from 'knex';
import { create, destroy } from './client';

describe('create', () => {
  it('should construct a new client', () => {
    create();
    expect(Knex).toHaveBeenCalledWith(
      expect.objectContaining({
        client: 'pg',
        connection: {},
        pool: { min: 0 },
      })
    );
  });
});

describe('destroy', () => {
  it('should call destroy on the client', () => {
    const client = { destroy: jest.fn() };
    destroy(client as never);
    expect(client.destroy).toHaveBeenCalled();
  });
});
