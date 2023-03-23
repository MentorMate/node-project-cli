type IsNullable<T, K> = null extends T ? K : never;

type NullableKeys<T> = { [K in keyof T]: IsNullable<T[K], K> }[keyof T];

/** `Partial` just for the nullable keys */
export type NullableKeysPartial<T> = Omit<T, NullableKeys<T>> &
  Partial<Pick<T, NullableKeys<T>>>;
