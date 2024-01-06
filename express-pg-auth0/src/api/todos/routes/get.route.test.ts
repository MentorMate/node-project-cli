import { getTodoRoute as route } from './get.route';

describe('route', () => {
  it('should be defined', () => {
    expect(route).toBeDefined();
  });

  describe('handler', () => {
    const todo = { id: 1, name: 'Laundry' };
    const todosService = { find: jest.fn(() => todo) };
    const req = {
      auth: { payload: { sub: '1' } },
      params: { id: 1 },
      services: { todosService },
    };
    const send = jest.fn();
    const status = jest.fn(() => ({ send }));
    const res = { send, status };

    it('should call TodoService#find', () => {
      route.handler(req as never, res as never, jest.fn());
      expect(todosService.find).toHaveBeenCalledWith(
        req.params.id,
        req.auth.payload.sub
      );
    });

    it('should send the found todo', () => {
      expect(send).toHaveBeenCalledWith(todo);
    });
  });
});
