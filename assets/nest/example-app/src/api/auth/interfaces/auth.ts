export interface JwtClaims {
  sub: number;
  email: string;
}

export interface UserData {
  user: JwtClaims;
}

export interface Credentials {
  email: string;
  password: string;
}
