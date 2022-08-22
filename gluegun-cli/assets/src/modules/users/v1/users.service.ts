// Here there should be the service for the users module

import { UserModel } from '../../../database/interfaces'
import { UserService as UserServiceType, UserObject } from '../interfaces'

export function UserService({ User }: { User: UserModel }): UserServiceType {
    function getUser(userId: string): UserObject {
        // Insert your own `getUser implementation
        // e.g. `User.findOne({ id: userId })
        // The following return is just to adhere to
        // the declared types
        return {
            id: 'generated uuid',
            name: 'John Doe',
            email: 'test@gmail.com',
            password: 'hashed/encrypted password'
        }
    }

    return {
        getUser
    }
}