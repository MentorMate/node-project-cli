import { listTodosRoute as route } from './list.route';

describe('route', () => {
  it('should be defined', () => {
    expect(route).toBeDefined();
  });

  describe('handler', () => {
    const todo = { id: 1, name: 'Laundry' };
    const response = {
      data: [todo],
      meta: {
        total: 1,
        page: 1,
        items: 20,
      },
    };
    const todosService = { list: jest.fn(() => response) };
    const req = {
      auth: { sub: '1' },
      query: { filters: { name: 'Laundy' } },
      services: { todosService },
    };
    const send = jest.fn();
    const status = jest.fn(() => ({ send }));
    const res = { send, status };

    it('should call TodoService#list', () => {
      route.handler(req as never, res as never, jest.fn());
      expect(todosService.list).toHaveBeenCalledWith(
        Number(req.auth.sub),
        req.query
      );
    });

    it('should send the paginated todo list', () => {
      expect(send).toHaveBeenCalledWith(response);
    });
  });
});
