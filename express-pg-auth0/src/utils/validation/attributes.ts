import { z } from 'zod';

export const id = z.string().openapi({ example: 'tz4a98xxat96iws9zmbrgj3a' });

export const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(255)
  .email()
  .openapi({ example: 'john@mail.com' });

export const password = z
  .string()
  .min(6)
  .max(255)
  .openapi({ example: 'MyS3cr37Pass' });

export const timestamp = z
  .string()
  .datetime()
  .openapi({ example: '2023-02-28T14:39:24.086Z' });
