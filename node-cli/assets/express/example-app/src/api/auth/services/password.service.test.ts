import { PasswordService } from './password.service';

describe('PasswordService', () => {
  const passwords = new PasswordService();

  describe('hash', () => {
    it('should return a different string', async () => {
      expect(await passwords.hash('some-text')).not.toBe('some-text');
    });
  });

  describe('compare', () => {
    it('should be true when the hash is of the value', async () => {
      const password = 'very-secret';
      const hash = await passwords.hash(password);

      expect(await passwords.compare(password, hash)).toBe(true);
    });

    it('should be false when the hash is not of the value', async () => {
      const password = 'very-secret';
      const hash = await passwords.hash(password);

      expect(await passwords.compare('not-my-password', hash)).toBe(false);
    });
  });
});
