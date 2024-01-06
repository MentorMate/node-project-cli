import { Transform } from 'class-transformer';

export const Trim = () =>
  Transform((params) => params.value?.trim(), { toClassOnly: true });
