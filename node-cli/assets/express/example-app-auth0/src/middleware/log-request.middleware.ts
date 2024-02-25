import { Request, Response, NextFunction } from 'express';
import { IncomingHttpHeaders } from 'http';
import { performance } from 'perf_hooks';
import { Logger } from 'pino';

const REMOVED = '[[REMOVED]]';

export function sanitizeHeaders(
  headers: IncomingHttpHeaders
): IncomingHttpHeaders {
  const sanitizedHeaders = { ...headers };

  if (sanitizedHeaders.Authorization) {
    sanitizedHeaders.Authorization = REMOVED;
  }

  if (sanitizedHeaders.Cookie) {
    sanitizedHeaders.Cookie = REMOVED;
  }

  return sanitizedHeaders;
}

export function sanitizeBody(body: IncomingHttpHeaders): IncomingHttpHeaders {
  const sanitizedBody = { ...body };

  if (sanitizedBody.password) {
    sanitizedBody.password = REMOVED;
  }

  return sanitizedBody;
}

export const logRequest =
  (logger: Logger) => (req: Request, res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    const startTime = performance.now();

    res.on('finish', () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      const { url, body, method, headers, ip } = req;

      const logMsg = {
        timestamp,
        duration: `${duration}ms`,
        ip,
        headers: sanitizeHeaders(headers),
        method,
        url,
        body: sanitizeBody(body),
      };

      logger.info(logMsg);
    });

    next();
  };
