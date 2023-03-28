import z from 'zod';
import { id as idSchema, timestamp } from './attributes';

export const id = z.object({
  id: idSchema,
});

export type ID = z.infer<typeof id>;

export const timestamps = z.object({
  createdAt: timestamp,
  updatedAt: timestamp,
});

export type Timestamps = z.infer<typeof timestamps>;
