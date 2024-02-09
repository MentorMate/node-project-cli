import { environmentSchema } from '@utils/environment';
import { create as createApp } from '../../src/app';

export const create = () => {
  const env = Object.freeze(environmentSchema.parse(process.env));
  return createApp(env);
};
