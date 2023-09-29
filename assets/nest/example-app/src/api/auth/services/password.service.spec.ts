import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';

describe('PasswordService', () => {
  let passwordsService: PasswordService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    passwordsService = app.get<PasswordService>(PasswordService);
  });

  describe('hash', () => {
    it('should return a different string', async () => {
      expect(await passwordsService.hash('some-text')).not.toBe('some-text');
    });
  });

  describe('compare', () => {
    it('should be true when the hash is of the value', async () => {
      const password = 'very-secret';
      const hash = await passwordsService.hash(password);

      expect(await passwordsService.compare(password, hash)).toBe(true);
    });

    it('should be false when the hash is not of the value', async () => {
      const password = 'very-secret';
      const hash = await passwordsService.hash(password);

      expect(await passwordsService.compare('not-my-password', hash)).toBe(
        false,
      );
    });
  });
});
