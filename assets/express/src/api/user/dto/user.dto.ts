import { z } from 'zod';
import { User } from '@entities';

export const createUserRequestPayload = User.omit({ role: true });

export const loginUserRequestPayload = z.object({
  email: z.string(),
  password: z.string({
    required_error: 'Password is required',
  }),
});

export const updateUserRequestPayload = User;

export const deleteUserRequestPayload = z.object({
  email: z.string(),
});

export const getUserRequestPayload = z.object({
  email: z.string(),
});

export const getOrDeleteUserRequestSchema = z.object({
  query: getUserRequestPayload,
});

export const createUserRequestSchema = z.object({
  body: createUserRequestPayload,
});

export const updateUserRequestSchema = z.object({
  body: updateUserRequestPayload,
});

export const loginUserRequestSchema = z.object({
  body: loginUserRequestPayload,
});

