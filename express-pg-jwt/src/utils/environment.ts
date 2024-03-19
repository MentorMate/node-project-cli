import { z } from 'zod';

const string = z.string().trim();
const port = z.coerce.number().int().gte(1024).lte(65535);
const expiration = z.coerce.number().int().gte(1000).or(z.string());
const secret = z.string().trim().min(10);

export const environmentSchema = z.object({
  // Node
  NODE_ENV: z.enum(['development', 'test', 'production']),

  // HTTP
  PORT: port,

  REQUEST_LOGGING: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true'),
  ERROR_LOGGING: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true'),

  // PostgreSQL
  PGHOST: string,
  PGPORT: port,
  PGUSER: string,
  PGPASSWORD: string,
  PGDATABASE: string,

  // JWT
  JWT_SECRET: secret,
  JWT_EXPIRATION: expiration,
});

export type Environment = Readonly<z.infer<typeof environmentSchema>>;
