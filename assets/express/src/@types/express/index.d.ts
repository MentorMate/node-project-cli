import { Services } from '@modules';

declare module 'express-serve-static-core' {
  interface Request {
    auth: {
      sub: string;
      email: string;
    };
    services: Services;
  }
}
