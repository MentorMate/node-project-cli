// Here there should be the TS interfaces and types related to the users module
// !!!          !!!             !!!
// Sample types, replace with your own
// !!!          !!!             !!!

export type UserObject = {
    id: string,
    name: string,
    email: string,
    password: string
} 

export type UserService = {
    getUser: (userId: string) => UserObject
}

export type UserController = {
    getUser: {
        method: string,
        path: string,
        middlewares?: any[],
        handler: any
    }
}
