import { v4 as uuidv4 } from 'uuid';
import { Credentials } from '@api/auth';

export const getUserCredentials: () => Credentials = () => ({
  email: uuidv4() + '@mail.com',
  password: uuidv4(),
});
