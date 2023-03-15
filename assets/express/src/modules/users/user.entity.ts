import { z } from 'zod';
import { Zod } from '@common';

export const userAttrs = {
  Email: (z: Zod) => z.string().openapi({ example: 'john@mail.com' }),
  Password: (z: Zod) =>
    z.string().min(6).max(50).openapi({ example: 'MyS3cr37Pass' }),
  Role: (z: Zod) => z.string().openapi({ example: 'user' }), // How to enforce to be part of ['user', 'admin'] enum?
  Timestamp: (z: Zod) =>
    z.string().datetime().openapi({ example: '2023-02-28T14:39:24.086Z' }),
};

const timestampsSchema = z.object({
  createdAt: userAttrs.Timestamp(z),
  updatedAt: userAttrs.Timestamp(z),
  deletedAt: userAttrs.Timestamp(z).nullable(),
});

export const userFieldsSchema = z.object({
  email: userAttrs.Email(z),
  password: userAttrs.Password(z),
  role: userAttrs.Role(z),
});

export const userSchema = userFieldsSchema.merge(timestampsSchema);
