import { Transform, plainToClass } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
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
  NODE_ENV: NodeEnvironment;

  @Min(1024)
  @Max(65535)
  @Transform(({ value }) => +value)
  PORT: number;

  @IsNotEmpty()
  @IsString()
  HOST: string;

  @Transform(({ value }) => Boolean(value))
  @IsNotEmpty()
  ERROR_LOGGING: boolean;

  @Transform(({ value }) => Boolean(value))
  @IsNotEmpty()
  REQUEST_LOGGING: boolean;

  @Transform(({ value }) => Boolean(value))
  @IsNotEmpty()
  SWAGGER: boolean;
}

class DatabaseEnvironmentValidator {
  @IsString()
  @IsNotEmpty()
  PGHOST: string;

  @Min(1024)
  @Max(65535)
  @IsInt()
  PGPORT: number;

  @IsString()
  @IsNotEmpty()
  PGUSER: string;

  @IsString()
  @IsNotEmpty()
  PGPASSWORD: string;

  @IsString()
  @IsNotEmpty()
  PGDATABASE: string;
}

class AuthEnvironmentValidator {
  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @Transform(({ value }) => +value)
  @IsInt()
  @IsNotEmpty()
  JWT_EXPIRATION: number;
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
      errorMessage += `${error.constraints[constraint]}\n`;
    }
  });

  if (errors.length > 0) {
    console.log('\x1b[4m%s\x1b[0m', 'Environment validation errors:');
    console.log('\x1b[31m%s\x1b[0m', errorMessage);

    process.exit(0);
  }

  return validatedConfig;
};

export const nodeConfig = registerAs('node', () =>
  validate(
    plainToClass(NodeEnvironmentValidator, process.env, {
      enableImplicitConversion: true,
    }),
  ),
);

export const dbConfig = registerAs('dbConfig', () =>
  validate(
    plainToClass(DatabaseEnvironmentValidator, process.env, {
      enableImplicitConversion: true,
    }),
  ),
);

export const authConfig = registerAs('authConfig', () =>
  validate(
    plainToClass(AuthEnvironmentValidator, process.env, {
      enableImplicitConversion: true,
    }),
  ),
);
