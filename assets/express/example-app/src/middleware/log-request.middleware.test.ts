import { logRequest } from './log-request.middleware';

describe('logRequest', () => {
  it('should log the request method and url', () => {
    const logger = { info: jest.fn() };
    const req = { method: 'GET', url: '/todos' };
    const next = jest.fn();

    logRequest(logger as never)(req as never, {} as never, next);

    expect(logger.info).toHaveBeenCalledWith('GET /todos');
    expect(next).toHaveBeenCalled();
  });
});
