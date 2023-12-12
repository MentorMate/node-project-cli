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

export enum MongoProtocol {
  onPremises = 'mongodb',
  atlasCloud = 'mongodb+srv',
}

class NodeEnvironmentValidator {
  @IsEnum(NodeEnvironment)
  NODE_ENV: NodeEnvironment;

  @Min(1024)
  @Max(65535)
  @Transform(({ value }) => +value)
  PORT: number;

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
  @IsEnum(MongoProtocol)
  MONGO_PROTOCOL: string;

  @IsString()
  @IsNotEmpty()
  MONGO_HOST: string;

  @IsInt()
  @Min(1024)
  @Max(65535)
  MONGO_PORT: number;

  @IsString()
  @IsNotEmpty()
  MONGO_USER: string;

  @IsString()
  @IsNotEmpty()
  MONGO_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  MONGO_DATABASE_NAME: string;
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
