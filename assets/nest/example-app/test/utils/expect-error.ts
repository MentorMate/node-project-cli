import { HttpException } from '@nestjs/common';

export const expectError =
  async <T extends HttpException>(ex: T, jsonResponse: Response['json']) => {
    const response = await jsonResponse();

    expect(ex.message).toEqual(response.error || response.message);
    expect(ex.getStatus()).toEqual(response.statusCode);
  };
