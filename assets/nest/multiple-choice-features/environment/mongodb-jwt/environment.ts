import util from 'node:util';
import { plainToClass } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

export enum NodeEnvironment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export enum MongoProtocol {
  onPremises = 'mongodb',
  atlasCloud = 'mongodb+srv',
}

export interface Environment {
  // Node
  NODE_ENV: NodeEnvironment;

  // HTTP
  PORT: number;

  // MongoDB
  MONGO_PROTOCOL: string;
  MONGO_HOST: string;
  MONGO_PORT: number;
  MONGO_USER: string;
  MONGO_PASSWORD: string;
  MONGO_DATABASE_NAME: string;

  // JWT
  JWT_SECRET: string;
  JWT_EXPIRATION: number;
}

class EnvironmentVariablesValidator implements Environment {
  @IsEnum(NodeEnvironment)
  NODE_ENV: NodeEnvironment;

  @IsInt()
  @Min(1024)
  @Max(65535)
  PORT: number;

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

  @IsString()
  JWT_SECRET: string;

  @IsInt()
  JWT_EXPIRATION: number;
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
