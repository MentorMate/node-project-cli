import { HttpAdapterHost } from '@nestjs/core';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ErrorLoggingFilter } from './error-logging.filter';

// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

describe('Error logging filter', () => {
  let httpAdapterHost: HttpAdapterHost;
  let errorLoggingFilter: ErrorLoggingFilter;
  const mockStatus = jest.fn();
  const mockGetResponse = jest.fn().mockImplementation(() => ({
    status: mockStatus,
  }));
  const mockHttpArgumentsHost = jest.fn().mockImplementation(() => ({
    getResponse: mockGetResponse,
  }));
  const mockArgumentsHost = {
    switchToHttp: mockHttpArgumentsHost,
    getArgByIndex: jest.fn(),
    getArgs: jest.fn(),
    getType: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
  };
  beforeEach(() => {
    httpAdapterHost = new HttpAdapterHost();
    httpAdapterHost.httpAdapter = {
      reply: jest.fn(),
    } as any;
    errorLoggingFilter = new ErrorLoggingFilter(httpAdapterHost);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('returns status 500 and logs the error when it is not a generic HTTP exception', () => {
    const err = new Error('Generic');
    errorLoggingFilter.catch(err, mockArgumentsHost);

    expect(errorLoggingFilter.logger.error).toHaveBeenCalledWith(err);
    expect(httpAdapterHost.httpAdapter.reply).toHaveBeenCalledTimes(1);
    expect(httpAdapterHost.httpAdapter.reply).toHaveBeenCalledWith(
      { status: mockStatus },
      err,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  });

  it('returns the status of the HTTP exception and logs the stringified error', () => {
    const err = new HttpException('Exception', HttpStatus.BAD_REQUEST);
    errorLoggingFilter.catch(err, mockArgumentsHost);

    expect(errorLoggingFilter.logger.error).toHaveBeenCalledWith('"Exception"');
    expect(httpAdapterHost.httpAdapter.reply).toHaveBeenCalledTimes(1);
    expect(httpAdapterHost.httpAdapter.reply).toHaveBeenCalledWith(
      { status: mockStatus },
      'Exception',
      HttpStatus.BAD_REQUEST,
    );
  });
});
