import { attachServices } from './attach-services.middleware';

describe('attachServices', () => {
  it('should assign the services to the request', () => {
    const services = {};
    const req = {};
    const next = jest.fn();

    const middleware = attachServices(services as never);
    middleware(req as never, {} as never, next);

    expect((req as { services: typeof services }).services).toBe(services);
    expect(next).toHaveBeenCalled();
  });
});
