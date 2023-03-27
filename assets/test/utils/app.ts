import { envSchema } from '@common/environment';
import { create as createApp } from '../../src/app';

export const create = () => {
  const env = Object.freeze(envSchema.parse(process.env));
  return createApp(env);
};
