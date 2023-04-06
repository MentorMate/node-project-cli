import { NullableKeysPartial } from '@common/utils';

export type Insert<T> = NullableKeysPartial<T>;

export type Update<T> = Partial<T>;
