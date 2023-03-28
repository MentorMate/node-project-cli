import z from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

declare module 'zod' {
  interface ZodNumber {
    coerce(): ZodNumber;
  }
}

declare module '@asteasolutions/zod-to-openapi' {
  interface ZodOpenAPIMetadata {
    schemaName: string;
  }
}

export const register = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (typeof z.ZodNumber.prototype.coerce === 'undefined') {
    z.ZodNumber.prototype.coerce = function () {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return new (this as any).constructor({
        ...this._def,
        coerce: true,
      });
    };
  }

  extendZodWithOpenApi(z);
};
