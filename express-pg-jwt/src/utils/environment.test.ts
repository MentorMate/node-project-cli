import { environmentSchema } from './environment';

describe('Environment Schema', () => {
  it('validates correct environment variables', () => {
    const validEnv = {
      NODE_ENV: 'development',
      PORT: 3000,
      REQUEST_LOGGING: 'true',
      ERROR_LOGGING: 'false',
      PGHOST: 'localhost',
      PGPORT: 5432,
      PGUSER: 'postgres',
      PGPASSWORD: 'password',
      PGDATABASE: 'testdb',
      JWT_EXPIRATION: '1000000',
      JWT_SECRET: 'JWT_SECRET'
    };

    const data = environmentSchema.parse(validEnv);

    expect(data).toEqual({
      NODE_ENV: 'development',
      PORT: 3000,
      REQUEST_LOGGING: true,
      ERROR_LOGGING: false,
      PGHOST: 'localhost',
      PGPORT: 5432,
      PGUSER: 'postgres',
      PGPASSWORD: 'password',
      PGDATABASE: 'testdb',
      JWT_EXPIRATION: 1000000,
      JWT_SECRET: 'JWT_SECRET'
    });
  });

  it('throws error for incorrect environment variables', () => {
    const invalidEnv = {
      NODE_ENV: 'invalid',
      PORT: 'not a number',
    };

    expect(() => environmentSchema.parse(invalidEnv)).toThrow();
  });
});
