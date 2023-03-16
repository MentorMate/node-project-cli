import { z } from 'zod';

type Zod = typeof z | typeof z.coerce;

export const todoAttrs = {
  ID: (z: Zod) => z.number().int().positive().openapi({ example: 1 }),
  Name: (z: Zod) => z.string().min(1).max(50).openapi({ example: 'Laundry' }),
  Note: (z: Zod) =>
    z.string().min(1).max(255).openapi({ example: 'Buy detergent' }),
  Timestamp: (z: Zod) =>
    z.string().datetime().openapi({ example: '2023-02-28T14:39:24.086Z' }),
};

const idSchema = z.object({
  id: todoAttrs.ID(z),
});

const timestampsSchema = z.object({
  createdAt: todoAttrs.Timestamp(z),
  updatedAt: todoAttrs.Timestamp(z),
  deletedAt: todoAttrs.Timestamp(z).nullable(),
});

export const todoFieldsSchema = z.object({
  name: todoAttrs.Name(z),
  note: todoAttrs.Note(z).nullable(),
});

export const todoSchema = todoFieldsSchema
  .merge(idSchema)
  .merge(timestampsSchema);
