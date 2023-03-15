import z from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

declare module '@asteasolutions/zod-to-openapi' {
  interface ZodOpenAPIMetadata {
    schemaName: string;
  }
}

export const register = () => {
  extendZodWithOpenApi(z);
};
