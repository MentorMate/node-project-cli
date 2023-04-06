import { v4 as uuidv4 } from 'uuid';
import { Login, Register } from '@common/data/auth';

export const getUserCredentials: () => Register | Login = () => ({
  email: uuidv4() + '@mail.com',
  password: uuidv4(),
});
