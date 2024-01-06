import z from 'zod';
import { id as idSchema, timestamp } from './attributes';

export const withId = z.object({
  id: idSchema,
});

export type WithId = z.infer<typeof withId>;

export const withTimestamps = z.object({
  createdAt: timestamp,
  updatedAt: timestamp,
});

export type WithTimestamps = z.infer<typeof withTimestamps>;
