/** `Partial` just for the nullable keys */
export type NullableKeysPartial<T> = {
  [K in keyof T]: null extends T[K] ? T[K] | undefined : T[K];
};
