export interface JwtClaims {
  sub: string;
  email: string;
}

export interface UserData {
  user: JwtClaims;
}
