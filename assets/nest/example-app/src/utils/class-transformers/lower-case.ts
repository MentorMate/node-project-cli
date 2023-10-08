import { Transform } from 'class-transformer';

const toLower = (v: string) => v.toLowerCase();

export const LowerCase = () =>
  Transform(
    (params) =>
      Array.isArray(params.value)
        ? params.value.map(toLower)
        : typeof params.value === 'string'
        ? toLower(params.value)
        : params.value,
    {
      toClassOnly: true,
    },
  );
