export interface JwtClaims {
  sub: number;
  email: string;
}

export interface UserData {
  user: JwtClaims;
}
