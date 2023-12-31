import { mockAxios } from '../test/utils/mock-axios';
mockAxios();

import { create } from './app';

describe('create', () => {
  it('should return an app instance and a destroy function', () => {
    const result = create({
      PORT: 3000,
      REQUEST_LOGGING: false,
      ERROR_LOGGING: false,
      AUTH0_ISSUER_URL: 'AUTH0_ISSUER_URL',
      AUTH0_CLIENT_ID: 'AUTH0_CLIENT_ID',
      AUTH0_AUDIENCE: 'AUTH0_AUDIENCE',
      AUTH0_CLIENT_SECRET: 'AUTH0_CLIENT_SECRET',
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
