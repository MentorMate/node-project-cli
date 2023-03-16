import { z } from 'zod';

const string = z.string().trim();
const port = z.coerce.number().int().gte(1024).lte(65535);

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
});

export type Environment = Readonly<z.infer<typeof envSchema>>;
