import { asyncHandler } from './handler';

describe('asyncHandler', () => {
  it('should pass the error to next when the promise returned by the handler is rejected', async () => {
    const error = new Error();
    const next = jest.fn();
    const handler = asyncHandler(async () => {
      throw error;
    });
    await handler({} as never, {} as never, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('should not call next when the promise returned by the handler is resolved', async () => {
    const next = jest.fn();
    const handler = asyncHandler(async () => null);
    await handler({} as never, {} as never, next);
    expect(next).not.toHaveBeenCalled();
  });
});
