import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthModuleMetadata } from './auth.module';
import { JwtTokensDto } from './dtos/jwt-tokens.dto';
import { Credentials } from './entities';
import { AuthService } from './services';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const credentials: Credentials = {
    email: 'admin@admin.com',
    password: 'Welcome1!',
  };
  const tokenResponse: JwtTokensDto = { idToken: 'testToken' };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule(
      AuthModuleMetadata,
    ).compile();

    authController = app.get<AuthController>(AuthController);
    authService = app.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should return the generated token', async () => {
      jest
        .spyOn(authService, 'register')
        .mockImplementationOnce(async () => tokenResponse);

      expect(await authController.register(credentials)).toStrictEqual(
        tokenResponse,
      );
    });
  });

  describe('login', () => {
    it('should return the generated token', async () => {
      jest
        .spyOn(authService, 'login')
        .mockImplementationOnce(async () => tokenResponse);

      expect(await authController.login(credentials)).toStrictEqual(
        tokenResponse,
      );
    });
  });
});
