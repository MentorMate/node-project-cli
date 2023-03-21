import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Zod } from '@common';

extendZodWithOpenApi(z);

const EXAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

export const authAttrs = {
  JwtToken: (z: Zod) =>
    z.string().openapi({
      example: EXAMPLE_JWT,
    }),
};

export const authSchema = z.object({
  idToken: authAttrs.JwtToken(z),
});
