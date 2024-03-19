import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CredentialsDto } from './dto';
import { AuthService } from './services';
import { Public } from '@utils/decorators';
import { JwtToken } from './entities';
import { Errors } from '@utils/enums';
import { ConflictDto, UnprocessableEntityDto } from '@utils/dtos';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @Public()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Register a user',
    description: 'Register a user',
  })
  @ApiBody({ type: CredentialsDto })
  @ApiOkResponse({
    description: 'OK',
    type: JwtToken,
  })
  @ApiConflictResponse({
    description: Errors.Conflict,
    type: ConflictDto,
  })
  @ApiUnprocessableEntityResponse({
    description: Errors.UnprocessableEntity,
    type: UnprocessableEntityDto,
  })
  register(@Body() credentials: CredentialsDto): Promise<JwtToken> {
    return this.authService.register(credentials);
  }

  @Post('login')
  @Public()
  @ApiOperation({
    summary: 'Login a user',
    description: 'Authenticate a user',
  })
  @ApiBody({ type: CredentialsDto })
  @ApiOkResponse({
    description: 'OK',
    type: JwtToken,
  })
  @ApiUnprocessableEntityResponse({
    description: Errors.UnprocessableEntity,
    type: UnprocessableEntityDto,
  })
  async login(@Body() credentials: CredentialsDto): Promise<JwtToken> {
    return this.authService.login(credentials);
  }
}
