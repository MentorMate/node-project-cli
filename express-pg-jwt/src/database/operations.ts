import { NullableKeysPartial } from '@utils/types';

// Nullable means both that you can put a null and that the default is null.
// Having a default value means that the key can be omitted (i.e. is optional),
// hence, all nullables keys are optional
/**
 * Makes nullable keys optional (partial) as well
 */
export type Insert<T> = NullableKeysPartial<T>;

/**
 * Makes all keys optional (partial)
 */
export type Update<T> = Partial<T>;
