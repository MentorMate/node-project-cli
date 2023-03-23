import { Services } from '@modules';

declare global {
  namespace Express {
    interface Request {
      services: Services;
    }
  }
}
