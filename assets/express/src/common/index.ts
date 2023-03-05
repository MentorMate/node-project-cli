import { z } from 'zod';

export * from './interfaces/factories';
export * from './interfaces/routes-and-schemas';

export type Environment = z.infer<typeof envSchema>;

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']),
  PORT: z.coerce.number().int().gte(1024).lte(65535),
});


