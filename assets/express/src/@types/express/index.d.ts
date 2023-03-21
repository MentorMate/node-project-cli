import { Services } from '@app/modules';

declare global {
  namespace Express {
    interface Request {
      services: Services;
    }
  }
}
