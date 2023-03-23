export interface PasswordService {
  compareHash: (password: string, hashedPassword: string) => Promise<boolean>;
  hashPassword: (password: string) => Promise<string>;
}
