import { z } from 'zod';

export const id = z.number().int().positive().openapi({ example: 1 });

export type ID = z.infer<typeof id>;

export const email = z
  .string()
  .max(255)
  .email()
  .openapi({ example: 'john@mail.com' });

export type Email = z.infer<typeof email>;

export const password = z
  .string()
  .min(6)
  .max(255)
  .openapi({ example: 'MyS3cr37Pass' });

export type Password = z.infer<typeof password>;

export const timestamp = z
  .string()
  .datetime()
  .openapi({ example: '2023-02-28T14:39:24.086Z' });

export type Timestamp = z.infer<typeof timestamp>;
