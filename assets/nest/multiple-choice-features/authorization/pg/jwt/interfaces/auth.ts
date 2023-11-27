export interface JwtClaims {
  sub: string;
  email: string;
}

export interface UserData {
  user: JwtClaims;
}

export interface Credentials {
  email: string;
  password: string;
}
