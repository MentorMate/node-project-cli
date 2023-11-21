import { MongoError } from 'mongodb';

export const isDatabaseError = (e: unknown): e is MongoError =>
  e instanceof MongoError && e.code !== undefined;

export const isUniqueViolation = (e: unknown) =>
  isDatabaseError(e) && e.code === 11000;
