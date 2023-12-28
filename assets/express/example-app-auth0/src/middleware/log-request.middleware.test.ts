import { logRequest } from './log-request.middleware';
import { Logger } from 'pino';
import { Request, Response } from 'express';

describe('logRequest', () => {
  it('should log the request details', () => {
    const logger: Partial<Logger> = { info: jest.fn() };
    const req: Partial<Request> = { 
      method: 'GET', 
      url: '/todos', 
      body: { password: 'secret' }, 
      headers: { Authorization: 'Bearer token', Cookie: 'cookie' }, 
      ip: '127.0.0.1' 
    };
    const res:  Partial<Response> = { on: jest.fn().mockImplementation((event, cb) => cb()) };
    const next = jest.fn();

    logRequest(logger as Logger)(req as Request, res as Response, next);

    const expectedLogMsg = {
      timestamp: expect.any(String),
      duration: expect.any(String),
      ip: req.ip,
      headers: { Authorization: '[[REMOVED]]', Cookie: '[[REMOVED]]' },
      method: req.method,
      url: req.url,
      body: { password: '[[REMOVED]]' },
    };

    expect(logger.info).toHaveBeenCalledWith(expectedLogMsg);
    expect(next).toHaveBeenCalled();
  });
});
