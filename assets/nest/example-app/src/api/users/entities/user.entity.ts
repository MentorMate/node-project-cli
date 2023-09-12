export interface GenericSchema {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface User extends GenericSchema {
  email: string;
  password: string;
}
