import { UserRepository } from '../interfaces';
import { User, UserPayload } from '@entities';

// This is just sample implementation at this point, the DB functionality
// will be added with next tickets
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export default function userOperations(dbConnection: any): UserRepository {
  async function getUser(email: string): Promise<User> {
    // Some DB operations...

    return dbConnection.users.get(email);
  }

  async function getAllUsers(): Promise<User[]> {
    // Some DB operations

    return Array.of(...dbConnection.users.values());
  }

  async function createUser(payload: UserPayload): Promise<User | null> {
    // Some DB operations...

    return dbConnection.users.set(payload.email, payload);
  }

  async function updateUser(payload: UserPayload): Promise<User | null> {
    // Some DB operations...

    return dbConnection.users.set(payload.email, payload);
  }

  async function deleteUser(email: string): Promise<boolean> {
    // Some DB operations...

    return dbConnection.users.delete(email);
  }

  return {
    getUser,
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
  };
}
