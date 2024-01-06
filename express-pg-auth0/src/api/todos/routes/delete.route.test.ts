import { deleteTodoRoute as route } from './delete.route';

describe('route', () => {
  it('should be defined', () => {
    expect(route).toBeDefined();
  });

  describe('handler', () => {
    const todosService = { delete: jest.fn(() => 1) };
    const req = {
      auth: { payload: { sub: '1' } },
      params: { id: 1 },
      services: { todosService },
    };
    const send = jest.fn();
    const status = jest.fn(() => ({ send }));
    const res = { send, status };

    it('should call TodoService#delete', () => {
      route.handler(req as never, res as never, jest.fn());
      expect(todosService.delete).toHaveBeenCalledWith(
        req.params.id,
        req.auth.payload.sub
      );
    });

    it('should respond with 201', () => {
      expect(status).toHaveBeenCalledWith(204);
    });

    it('should send nothing', () => {
      expect(send).toHaveBeenCalled();
    });
  });
});
