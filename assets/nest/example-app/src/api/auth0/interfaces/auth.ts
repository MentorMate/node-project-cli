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

export type Auth0User = {
  blocked: boolean;
  created_at: string;
  email: string;
  email_verified: boolean;
  identities: {
    connection: string;
    user_id: string;
    provider: string;
    isSocial: boolean;
  }[];
  name: string;
  nickname: string;
  picture: string;
  updated_at: string;
  user_id: string;
  user_metadata: Record<string, any>;
};