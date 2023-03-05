import { User, UserPayload } from '@entities'

export const STATUS = {
  SUCCESS: 'Success',
  FAILURE: 'Failure'
}
export type ServiceResponse<T> = Promise<{
  errors: unknown[],
  status: typeof STATUS[keyof typeof STATUS],
  data: T[]
}>

export type IsNullable<T, K> = null extends T ? K : never;
export type NullableKeys<T> = { [K in keyof T]: IsNullable<T[K], K> }[keyof T];
export type NullableKeysPartial<T> = Omit<T, NullableKeys<T>> & Partial<Pick<T, NullableKeys<T>>>;

//
// User Service
//
export type UserForExternalUse = Omit<User, 'password'>

export interface UserService {
  loginUser: (
    payload: Pick<User, 'email' | 'password'>
  ) => ServiceResponse<{ token: string }>
  createUser: (
    payload: UserPayload
  ) => ServiceResponse<UserForExternalUse>;
  getAllUsers: () => ServiceResponse<UserForExternalUse>;
  getUser: (payload: Pick<User, 'email'>) => ServiceResponse<UserForExternalUse>;
  updateUser: (
    payload: UserPayload
  ) => ServiceResponse<UserForExternalUse>;
  deleteUser: (
    payload: Pick<User, 'email'>
  ) => ServiceResponse<undefined>;
}
