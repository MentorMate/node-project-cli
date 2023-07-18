import { createTodoRoute as route } from './create.route';

describe('route', () => {
  it('should be defined', () => {
    expect(route).toBeDefined();
  });

  describe('handler', () => {
    const todo = { id: 1, name: 'Laundry' };
    const todosService = { create: jest.fn(() => todo) };
    const req = {
      auth: { sub: '1' },
      body: { name: 'Laundry' },
      services: { todosService },
    };
    const send = jest.fn();
    const status = jest.fn(() => ({ send }));
    const res = { send, status };

    it('should call TodoService#create', () => {
      route.handler(req as never, res as never, jest.fn());
      expect(todosService.create).toHaveBeenCalledWith({
        ...req.body,
        userId: Number(req.auth.sub),
      });
    });

    it('should respond with 201', () => {
      expect(status).toHaveBeenCalledWith(201);
    });

    it('should send the created todo', () => {
      expect(send).toHaveBeenCalledWith(todo);
    });
  });
});
