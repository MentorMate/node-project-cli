import { z } from 'zod';

const string = z.string().trim();
const port = z.coerce.number().int().gte(1024).lte(65535);
const secret = z.string().trim().min(10);

export const environmentSchema = z.object({
  // Node
  NODE_ENV: z.enum(['development', 'test', 'production']),

  // HTTP
  PORT: port,

  REQUEST_LOGGING: z.enum(['true', 'false']).transform((value) => value === 'true'),
  ERROR_LOGGING: z.enum(['true', 'false']).transform((value) => value === 'true'),

  // PostgreSQL
  // TODO: this limits your options, should be revisited
  PGHOST: string,
  PGPORT: port,
  PGUSER: string,
  PGPASSWORD: string,
  PGDATABASE: string,

  // JWT
  AUTH0_ISSUER_URL: string,
  AUTH0_CLIENT_ID: string,
  AUTH0_AUDIENCE: string,
  AUTH0_CLIENT_SECRET: secret,
});

export type Environment = Readonly<z.infer<typeof environmentSchema>>;
