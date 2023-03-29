import { Login, Register } from '@common/data/auth';

export const getUserCredentials: () => Register | Login = () => ({
  email: Date.now() + '@mail.com',
  password: Date.now().toString(),
});
