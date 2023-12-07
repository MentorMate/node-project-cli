import { Transform, plainToClass } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUrl,
  Max,
  Min,
  validateSync,
} from 'class-validator';
import { registerAs } from '@nestjs/config';

export enum NodeEnvironment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class NodeEnvironmentValidator {
  @IsEnum(NodeEnvironment)
  env: NodeEnvironment;

  @Min(1024)
  @Max(65535)
  @Transform(({ value }) => +value)
  port: number;
}

class DatabaseEnvironmentValidator {
  @IsString()
  @IsNotEmpty()
  host: string;

  @IsInt()
  @Min(1024)
  @Max(65535)
  port: number;

  @IsString()
  @IsNotEmpty()
  user: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  database: string;
}

class AuthEnvironmentValidator {
  @IsString()
  @IsUrl()
  @Transform(({ value = '' }) => (value.endsWith('/') ? value : `${value}/`))
  issuerUrl: string;

  @IsString()
  clientId: string;

  @IsString()
  audience: string;

  @IsString()
  clientSecret: string;
}

const validate = <T extends object>(validatedConfig: T): T => {
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
    whitelist: true,
    stopAtFirstError: true,
  });

  let errorMessage = '';
  errors.forEach((error) => {
    for (const constraint in error.constraints) {
      errorMessage += `${error.property} - ${error.constraints[constraint]}\n`;
    }
  });

  if (errorMessage) {
    console.log(errorMessage);
    process.exit(1);
  }

  return validatedConfig;
};

export const nodeConfig = registerAs('node', () =>
  validate(
    plainToClass(
      NodeEnvironmentValidator,
      {
        env: process.env.NODE_ENV,
        port: process.env.PORT,
      },
      {
        enableImplicitConversion: true,
      },
    ),
  ),
);

export const dbConfig = registerAs('dbConfig', () =>
  validate(
    plainToClass(
      DatabaseEnvironmentValidator,
      {
        host: process.env.PGHOST,
        port: process.env.PGPORT,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
      },
      {
        enableImplicitConversion: true,
      },
    ),
  ),
);

export const authConfig = registerAs('authConfig', () =>
  validate(
    plainToClass(
      AuthEnvironmentValidator,
      {
        issuerUrl: process.env.AUTH0_ISSUER_URL,
        clientId: process.env.AUTH0_CLIENT_ID,
        audience: process.env.AUTH0_AUDIENCE,
        clientSecret: process.env.AUTH0_CLIENT_SECRET,
      },
      {
        enableImplicitConversion: true,
      },
    ),
  ),
);
