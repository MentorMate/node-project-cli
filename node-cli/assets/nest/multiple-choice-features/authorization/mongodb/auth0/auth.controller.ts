import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CredentialsDto } from './dto';
import { AuthService } from './services/auth.service';
import { Public } from '@utils/decorators';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,
  ) {}

  @Public()
  @Post('register')
  register(@Body() credentials: CredentialsDto) {
    return this.authService.register(credentials);
  }
}
