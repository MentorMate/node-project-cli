import { z } from 'zod';

const string = z.string().trim();
const port = z.coerce.number().int().gte(1024).lte(65535);
const expiration = z.coerce.number().int().gte(1000).or(z.string());
const secret = z.string().trim().min(10);

export const envSchema = z.object({
  // Node
  NODE_ENV: z.enum(['development', 'production']),

  // HTTP
  PORT: port,

  // PostgreSQL
  // TODO: this limits your options, should be revisited
  PGHOST: string,
  PGPORT: port,
  PGUSER: string,
  PGPASSWORD: string,
  PGDATABASE: string,

  // JWT
  JWT_SECRET: secret,
  JWT_EXPIRATION: expiration,
});

export type Environment = Readonly<z.infer<typeof envSchema>>;
