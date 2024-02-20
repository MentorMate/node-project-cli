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
      AUTH0_ISSUER_URL: 'https://example.com/',
      AUTH0_CLIENT_ID: 'clientid',
      AUTH0_AUDIENCE: 'audience',
      AUTH0_CLIENT_SECRET: 'secret_secret_secret',
    };

    const data = environmentSchema.parse(validEnv);

    expect(data).toEqual(    {
      NODE_ENV: 'development',
      PORT: 3000,
      REQUEST_LOGGING: true,
      ERROR_LOGGING: false,
      PGHOST: 'localhost',
      PGPORT: 5432,
      PGUSER: 'postgres',
      PGPASSWORD: 'password',
      PGDATABASE: 'testdb',
      AUTH0_ISSUER_URL: 'https://example.com/',
      AUTH0_CLIENT_ID: 'clientid',
      AUTH0_AUDIENCE: 'audience',
      AUTH0_CLIENT_SECRET: 'secret_secret_secret'
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
