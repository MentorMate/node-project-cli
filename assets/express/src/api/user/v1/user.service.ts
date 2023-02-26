import { ServiceFactory } from '@common';
import { UserModuleHelpersFunctions } from '../helpers';
import {
  loginUserRequestPayload,
  loginUserResponsePayload,
  createUserRequestPayload,
  createOrUpdateUserResponsePayload,
  deleteUserRequestPayload,
  deleteUserResponsePayload,
  getUserRequestPayload,
  getUserResponsePayload,
  updateUserRequestPayload,
  UserService,
} from '../interfaces';

import jwt from 'jsonwebtoken';
import { User, UserPayload } from '../../../entities';

const JWT_SECRET: string = process.env.JWT_SECRET_KEY || 'Jw7_S3Cr37K3y';

export const userServiceFactory: ServiceFactory<
  { id: string; payload: UserPayload; entity: User },
  UserService,
  UserModuleHelpersFunctions
> = function (userDbLayer, helpers) {
  async function loginUser(
    payload: loginUserRequestPayload
  ): Promise<loginUserResponsePayload> {
    const { email, password } = payload;
    const errors = [];
    let token;

    try {
      const user = await userDbLayer.get(email);
      console.log({ user });
      if (!user) {
        throw new Error('Wrong email or password');
      }

      const passwordCheck = await helpers.compareHash(password, user.password);

      if (!passwordCheck) {
        throw new Error('Wrong email or password');
      }

      token =
        jwt.sign(
          {
            email: email,
            role: user.role,
          },
          JWT_SECRET
        ) || null;
    } catch (err) {
      if (err instanceof Error) {
        errors.push(err.message);
      } else {
        errors.push('Unknown Error');
      }
    }

    const data = !errors.length && token ? [{ token }] : [];

    return {
      errors,
      status: data.length ? 'Success' : 'Failure',
      data,
    };
  }

  async function createUser(
    payload: createUserRequestPayload
  ): Promise<createOrUpdateUserResponsePayload> {
    const { email, password, ...attributes } = payload;
    console.log({ payload });
    const errors: Error[] = [];
    let user;

    try {
      const hashedPassword = await helpers.hashPassword(10, password);
      user = await userDbLayer.create({
        email,
        password: hashedPassword,
        ...attributes,
        role: 'user',
      });
    } catch (err) {
      errors.push(err as Error);
    }

    return {
      errors,
      status: !errors.length && user ? 'Success' : 'Failure',
      data: !errors.length && user ? [user] : [],
    };
  }

  async function getAllUsers(): Promise<getUserResponsePayload> {
    let users;
    const errors: Error[] = [];

    try {
      users = await userDbLayer.getAll();
    } catch (err) {
      errors.push(err as Error);
    }

    return {
      errors,
      status: !errors.length && users ? 'Success' : 'Failure',
      data: !errors.length && users ? users : [],
    };
  }

  async function getUser(
    payload: getUserRequestPayload
  ): Promise<getUserResponsePayload> {
    let user;
    const errors: Error[] = [];

    try {
      user = await userDbLayer.get(payload.email);
    } catch (err) {
      errors.push(err as Error);
    }

    return {
      errors,
      status: !errors.length && user ? 'Success' : 'Failure',
      data: !errors.length && user ? [user] : [],
    };
  }

  async function updateUser(
    payload: updateUserRequestPayload
  ): Promise<createOrUpdateUserResponsePayload> {
    let updatedUser;
    const errors: Error[] = [];

    try {
      updatedUser = await userDbLayer.update(payload);
    } catch (err) {
      errors.push(err as Error);
    }

    return {
      errors,
      status: !errors.length && updatedUser ? 'Success' : 'Failure',
      data: !errors.length && updatedUser ? [updatedUser] : [],
    };
  }

  async function deleteUser(
    payload: deleteUserRequestPayload
  ): Promise<deleteUserResponsePayload> {
    let deleteOperation;
    const errors: Error[] = [];

    try {
      deleteOperation = await userDbLayer.delete(payload.email);
    } catch (err) {
      errors.push(err as Error);
    }

    return {
      errors,
      status: !errors.length && deleteOperation ? 'Success' : 'Failure',
    };
  }

  return {
    loginUser,
    createUser,
    updateUser,
    getUser,
    getAllUsers,
    deleteUser,
  };
};
