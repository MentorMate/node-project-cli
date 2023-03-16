import { AuthInput, JWT } from '..';

export interface AuthService {
  login: (payload: AuthInput) => Promise<JWT | undefined>;
}
