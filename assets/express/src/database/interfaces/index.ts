import { User, UserPayload } from '@entities';
import { IDbLayer } from '@common';

export type UsersMethods = IDbLayer<string, UserPayload, User>;

export type DbLayerCollection = {
  userDbLayer: UsersMethods;
  // todoDbLayer: TodosMethods;
};
