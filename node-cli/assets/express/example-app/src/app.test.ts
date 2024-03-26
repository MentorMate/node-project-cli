import { create } from './app';

describe('create', () => {
  it('should return an app instance and a destroy function', () => {
    const result = create({
      PORT: 3000,
      HOST: 'localhost',
      REQUEST_LOGGING: false,
      ERROR_LOGGING: false,
      JWT_EXPIRATION: 1,
      JWT_SECRET: 'secret',
      NODE_ENV: 'test',
      PGDATABASE: 'database',
      PGHOST: 'localhost',
      PGPASSWORD: 'password',
      PGPORT: 5432,
      PGUSER: 'user',
    });

    expect(result.app).toBeDefined();
    expect(result.destroy).toBeDefined();
  });
});
