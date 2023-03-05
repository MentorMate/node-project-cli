import {
  STATUS,
  UserService,
} from './interfaces';

import jwt from 'jsonwebtoken';
import { UserPayload } from '../entities';
import { hashPassword, compareHash } from './helpers';
import { UserRepository } from '@database';

const JWT_SECRET: string = process.env.JWT_SECRET_KEY || 'Jw7_S3Cr37K3y';

export function userServiceFactory(userRepository: UserRepository): UserService {
  async function loginUser(
    payload: { email: string, password: string }
  ) { 
    const { email, password } = payload;
    const errors = [];
    let token;

    try {
      const user = await userRepository.getUser(email);
      console.log({ user });
      if (!user) {
        throw new Error('Wrong email or password');
      }

      const passwordCheck = await compareHash(password, user.password);

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
      status: data.length ? STATUS.SUCCESS : STATUS.FAILURE,
      data,
    };
  }

  async function createUser(
    payload: UserPayload
  ) {
    const { email, password, ...attributes } = payload;
    console.log({ payload });
    const errors: Error[] = [];
    let user;

    try {
      const hashedPassword = await hashPassword(10, password);
      user = await userRepository.createUser({
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
      status: !errors.length && user ? STATUS.SUCCESS: STATUS.FAILURE,
      data: !errors.length && user ? [user] : [],
    };
  }

  async function getAllUsers() {
    let users;
    const errors: Error[] = [];

    try {
      users = await userRepository.getAllUsers();
    } catch (err) {
      errors.push(err as Error);
    }

    return {
      errors,
      status: !errors.length && users ? STATUS.SUCCESS : STATUS.FAILURE,
      data: !errors.length && users ? users : [],
    };
  }

  async function getUser(
    payload: { email: string }
  ) {
    let user;
    const errors: Error[] = [];

    try {
      user = await userRepository.getUser(payload.email);
    } catch (err) {
      errors.push(err as Error);
    }

    return {
      errors,
      status: !errors.length && user ? STATUS.SUCCESS: STATUS.FAILURE,
      data: !errors.length && user ? [user] : [],
    };
  }

  async function updateUser(
    payload: UserPayload
  ) {
    let updatedUser;
    const errors: Error[] = [];

    try {
      updatedUser = await userRepository.updateUser(payload);
    } catch (err) {
      errors.push(err as Error);
    }

    return {
      errors,
      status: !errors.length && updatedUser ? STATUS.SUCCESS: STATUS.FAILURE,
      data: !errors.length && updatedUser ? [updatedUser] : [],
    };
  }

  async function deleteUser(
    payload: { email: string }
  ) {
    let deleteOperation;
    const errors: Error[] = [];

    try {
      deleteOperation = await userRepository.deleteUser(payload.email);
    } catch (err) {
      errors.push(err as Error);
    }

    return {
      errors,
      status: !errors.length && deleteOperation ? STATUS.SUCCESS : STATUS.FAILURE,
      data: []
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
