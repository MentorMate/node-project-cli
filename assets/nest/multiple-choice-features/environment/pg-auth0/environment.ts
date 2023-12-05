import util from 'node:util';
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

export enum NodeEnvironment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export interface Environment {
  // Node
  NODE_ENV: NodeEnvironment;

  // HTTP
  PORT: number;

  // PostgreSQL
  PGHOST: string;
  PGPORT: number;
  PGUSER: string;
  PGPASSWORD: string;
  PGDATABASE: string;

  // Auth0
  AUTH0_ISSUER_URL: string;
  AUTH0_CLIENT_ID: string;
  AUTH0_AUDIENCE: string;
  AUTH0_CLIENT_SECRET: string;
}

class EnvironmentVariablesValidator implements Environment {
  @IsEnum(NodeEnvironment)
  NODE_ENV: NodeEnvironment;

  @IsInt()
  @Min(1024)
  @Max(65535)
  PORT: number;

  @IsString()
  @IsNotEmpty()
  PGHOST: string;

  @IsInt()
  @Min(1024)
  @Max(65535)
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

  @IsString()
  @IsUrl()
  @Transform(({ value }) => (value.endsWith('/') ? value : `${value}/`))
  AUTH0_ISSUER_URL: string;

  @IsString()
  AUTH0_CLIENT_ID: string;

  @IsString()
  AUTH0_AUDIENCE: string;

  @IsString()
  AUTH0_CLIENT_SECRET: string;
}

export const validateConfig = (
  config: Record<string, unknown>,
): Environment => {
  const validatedConfig = plainToClass(EnvironmentVariablesValidator, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
    whitelist: true,
  });

  if (errors.length > 0) {
    throw new Error(util.inspect(errors));
  }

  return validatedConfig;
};
