import { CreateUser, CreateUserInput } from '@modules';

interface MapCreateUserFunction {
  (user: CreateUserInput, idToken: string): CreateUser;
}

const mapCreateUser: MapCreateUserFunction = (
  user: CreateUserInput,
  idToken: string
) => ({
  user: {
    email: user.email,
    role: user.role,
  },
  idToken,
});

export interface UserModuleHelpersFunctions
  extends Record<string, CallableFunction> {
  mapCreateUser: MapCreateUserFunction;
}

export { mapCreateUser };
