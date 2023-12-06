import 'reflect-metadata';
import { validateConfig } from './environment';

describe('validateConfig', () => {
  it('should be defined', () => {
    expect(validateConfig).toBeDefined();
  });

  it('should return the validated env when valid', () => {
    const env = validateConfig({
      NODE_ENV: 'test',
      PORT: 3000,
      MONGO_PROTOCOL: 'mongodb',
      MONGO_HOST: 'localhost',
      MONGO_PORT: 27017,
      MONGO_USER: 'user',
      MONGO_PASSWORD: 'password',
      MONGO_DATABASE_NAME: 'database',
      THIS_SHOULD_NOT_BE_INCLUDED: 'some-value',
    });

    expect(env.PORT).toBe(3000);
    expect(env.MONGO_PORT).toBe(27017);
    expect(env).not.toHaveProperty('THIS_SHOULD_NOT_BE_INCLUDED');
  });

  it('should throw an exception when invalid', () => {
    expect(() => validateConfig({})).toThrowError();
  });
});
