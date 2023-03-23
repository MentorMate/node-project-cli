import { NullableKeysPartial } from '@common/types';

export type Insert<T> = NullableKeysPartial<T>;

export type Update<T> = Partial<T>;
