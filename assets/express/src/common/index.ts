import { z } from 'zod';
import { RequestKey } from './interfaces';

export * from './interfaces';

export function makeResponsePayload<T extends z.ZodTypeAny>(schema: T) {
  return z.object({
    errors: z.array(z.any()),
    status: z.enum(['Success', 'Failure']),
    data: z.array(schema).optional(),
  });
}

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']),
  PORT: z.coerce.number().int().gte(1024).lte(65535),
});

export type Environment = z.infer<typeof envSchema>;

export type RequestSchema = z.ZodObject<{ [k in RequestKey]?: z.AnyZodObject }>;
