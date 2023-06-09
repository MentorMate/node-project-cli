import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Post,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { AuthServiceInterface } from './interfaces';
import { CredentialsDto, JwtTokensDto } from './dtos';
import { AuthService } from './services';
import { ConflictDto, UnprocessableEntityDto } from '@utils/api/response';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthServiceInterface,
  ) {}

  @Post('register')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Register a user',
    description: 'Register a user',
  })
  @ApiBody({ type: CredentialsDto })
  @ApiOkResponse({
    description: 'OK',
    type: JwtTokensDto,
  })
  @ApiConflictResponse({
    description: 'Conflict',
    type: ConflictDto,
  })
  @ApiUnprocessableEntityResponse({
    description: 'UnprocessableEntity',
    type: UnprocessableEntityDto,
  })
  register(@Body() credentials: CredentialsDto): Promise<JwtTokensDto> {
    return this.authService.register(credentials);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login a user',
    description: 'Authenticate a user',
  })
  @ApiBody({ type: CredentialsDto })
  @ApiOkResponse({
    description: 'OK',
    type: JwtTokensDto,
  })
  @ApiUnprocessableEntityResponse({
    description: 'UnprocessableEntity',
    type: UnprocessableEntityDto,
  })
  async login(@Body() credentials: CredentialsDto): Promise<JwtTokensDto> {
    const tokens = await this.authService.login(credentials);

    if (!tokens) {
      throw new UnprocessableEntityException('Invalid email or password');
    }

    return tokens;
  }
}
