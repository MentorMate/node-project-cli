import '@extensions/zod/register';

import route from './update';

describe('route', () => {
  it('should be defined', () => {
    expect(route).toBeDefined();
  });

  describe('handler', () => {
    const todo = { id: 1, name: 'Laundry' };
    const todosService = { update: jest.fn(() => todo) };
    const req = {
      auth: { sub: '1' },
      params: { id: 1 },
      body: { name: 'Laundry' },
      services: { todosService },
    };
    const send = jest.fn();
    const status = jest.fn(() => ({ send }));
    const res = { send, status };

    it('should call TodoService#update', () => {
      route.handler(req as never, res as never, jest.fn());
      expect(todosService.update).toHaveBeenCalledWith(
        req.params.id,
        Number(req.auth.sub),
        req.body
      );
    });

    it('should send the updated todo', () => {
      expect(send).toHaveBeenCalledWith(todo);
    });
  });
});
