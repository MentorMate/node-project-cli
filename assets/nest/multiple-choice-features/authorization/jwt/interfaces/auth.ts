import { ObjectId } from 'mongodb';

export interface JwtClaims {
  sub: ObjectId;
  email: string;
}

export interface UserData {
  user: JwtClaims;
}

export interface Credentials {
  email: string;
  password: string;
}
