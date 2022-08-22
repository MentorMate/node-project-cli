// This should be the controller for the users module with all the routes needed.
// Provided is a sample storage of the route arguments in an plain object that can 
// be used elsewhere to actually register the route. This was done only to showcase
// the connection between the controller, the database model and the service. You can
// choose to define your routes in entirely different way.

import { User } from '../../../database/models/user.model'
import { UserService } from './users.service'

const userService = UserService({User});

export const UserController = {
    getUser: {
        method: 'GET',
        path: '/users/:id',
        middlewares: [/* Insert error handlers, Authentication middleware, DTO checks, etc.*/],
        handler: async function getUserHandler(req, res) {
            // Sample implementation, CHANGE with your own
            const userId = req.params.id;
            const foundUser = await userService.getUser(userId)

            res.status(200).json(foundUser)
        }
    }
}