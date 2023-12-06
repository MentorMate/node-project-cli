import { validateConfig } from './environment';

describe('validateConfig', () => {
  it('should be defined', () => {
    expect(validateConfig).toBeDefined();
  });

  it('should return the validated env when valid', () => {
    const env = validateConfig({
      NODE_ENV: 'test',
      PORT: '3000',
      PGHOST: 'localhost',
      PGPORT: '5432',
      PGUSER: 'user',
      PGPASSWORD: 'password',
      PGDATABASE: 'database',
      THIS_SHOULD_NOT_BE_INCLUDED: 'some-value',
    });

    expect(env.PORT).toBe(3000);
    expect(env.PGPORT).toBe(5432);
    expect(env).not.toHaveProperty('THIS_SHOULD_NOT_BE_INCLUDED');
  });

  it('should throw an exception when invalid', () => {
    expect(() => validateConfig({})).toThrowError();
  });
});
