import { authConfig, dbConfig, nodeConfig } from './environment';

describe('Environment', () => {
  let origEnv: any;

  beforeAll(() => {
    origEnv = { ...process.env };
    jest.spyOn(process, 'exit').mockImplementation(() => true as never);
    jest.spyOn(console, 'log').mockImplementation(() => true as never);
  });

  afterEach(() => {
    process.env = origEnv;
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.spyOn(process, 'exit').mockRestore();
    jest.spyOn(console, 'log').mockRestore();
  });

  describe('NodeEnvironmentValidator', () => {
    function setValidEnv() {
      process.env.PORT = '3000';
      process.env.HOST = 'localhost';
      process.env.ERROR_LOGGING = 'false';
      process.env.REQUEST_LOGGING = 'false';
      process.env.SWAGGER = 'false';
      process.env.NODE_ENV = 'test';
    }
    describe('PORT', () => {
      it('transforms the PORT value to a number', () => {
        setValidEnv();
        process.env.PORT = '1234';

        expect(nodeConfig().PORT).toEqual(1234);
        expect(process.exit).toHaveBeenCalledTimes(0);
        expect(console.log).toHaveBeenCalledTimes(0);
      });

      it('throws an error when PORT is bellow 1024', () => {
        setValidEnv();
        process.env.PORT = '1000';

        nodeConfig();

        expect(process.exit).toHaveBeenCalledWith(0);
        expect(console.log).toHaveBeenCalledWith(
          '\x1b[31m%s\x1b[0m',
          'PORT must not be less than 1024\n',
        );
      });

      it('throws an error when PORT is above 65535', () => {
        setValidEnv();
        process.env.PORT = '66666';

        nodeConfig();

        expect(process.exit).toHaveBeenCalledWith(0);
        expect(console.log).toHaveBeenCalledWith(
          '\x1b[31m%s\x1b[0m',
          'PORT must not be greater than 65535\n',
        );
      });
    });

    describe('NODE_ENV', () => {
      it('accepts a valid NODE_ENV', () => {
        setValidEnv();
        process.env.NODE_ENV = 'development';

        expect(nodeConfig().NODE_ENV).toEqual('development');
        expect(process.exit).toHaveBeenCalledTimes(0);
        expect(console.log).toHaveBeenCalledTimes(0);
      });

      it('throws an error when NODE_ENV is not valid', () => {
        setValidEnv();
        process.env.NODE_ENV = 'test-in-prod';

        nodeConfig();

        expect(process.exit).toHaveBeenCalledWith(0);
        expect(console.log).toHaveBeenCalledWith(
          '\x1b[31m%s\x1b[0m',
          'NODE_ENV must be one of the following values: development, production, test\n',
        );
      });
    });

    ['SWAGGER', 'REQUEST_LOGGING', 'ERROR_LOGGING'].forEach((env) => {
      describe(env, () => {
        it(`transforms the ${env} value to a boolean`, () => {
          setValidEnv();
          process.env[env] = 'false';

          expect(nodeConfig()[env as never]).toEqual(true);
          expect(process.exit).toHaveBeenCalledTimes(0);
          expect(console.log).toHaveBeenCalledTimes(0);
        });

        it(`throws an error when ${env} is empty`, () => {
          setValidEnv();
          delete process.env[env];

          nodeConfig();

          expect(process.exit).toHaveBeenCalledWith(0);
          expect(console.log).toHaveBeenCalledWith(
            '\x1b[31m%s\x1b[0m',
            `${env} should not be empty\n`,
          );
        });
      });
    });
  });

  describe('DatabaseEnvironmentValidator', () => {
    function setValidEnv() {
      process.env.PGHOST = 'localhost';
      process.env.PGPORT = '5432';
      process.env.PGUSER = 'user';
      process.env.PGPASSWORD = 'password';
      process.env.PGDATABASE = 'test-db';
    }
    describe('PGPORT', () => {
      it('transforms the PGPORT value to a number', () => {
        setValidEnv();
        process.env.PGPORT = '1234';

        expect(dbConfig().PGPORT).toEqual(1234);
        expect(process.exit).toHaveBeenCalledTimes(0);
        expect(console.log).toHaveBeenCalledTimes(0);
      });

      it('throws an error when PGPORT is bellow 1024', () => {
        setValidEnv();
        process.env.PGPORT = '1000';

        dbConfig();

        expect(process.exit).toHaveBeenCalledWith(0);
        expect(console.log).toHaveBeenCalledWith(
          '\x1b[31m%s\x1b[0m',
          'PGPORT must not be less than 1024\n',
        );
      });

      it('throws an error when PGPORT is above 65535', () => {
        setValidEnv();
        process.env.PGPORT = '66666';

        dbConfig();

        expect(process.exit).toHaveBeenCalledWith(0);
        expect(console.log).toHaveBeenCalledWith(
          '\x1b[31m%s\x1b[0m',
          'PGPORT must not be greater than 65535\n',
        );
      });

      it('throws an error when PGPORT is not integer', () => {
        setValidEnv();
        process.env.PGPORT = '123,45';

        dbConfig();

        expect(process.exit).toHaveBeenCalledWith(0);
        expect(console.log).toHaveBeenCalledWith(
          '\x1b[31m%s\x1b[0m',
          'PGPORT must be an integer number\n',
        );
      });
    });

    ['PGHOST', 'PGUSER', 'PGPASSWORD', 'PGDATABASE'].forEach((env) => {
      describe(env, () => {
        it(`throws an error when ${env} is empty`, () => {
          setValidEnv();
          delete process.env[env];

          dbConfig();

          expect(process.exit).toHaveBeenCalledWith(0);
          expect(console.log).toHaveBeenCalledWith(
            '\x1b[31m%s\x1b[0m',
            `${env} should not be empty\n`,
          );
        });
      });
    });
  });

  describe('AuthEnvironmentValidator', () => {
    function setValidEnv() {
      process.env.AUTH0_ISSUER_URL = 'http://mock-auth.com/';
      process.env.AUTH0_CLIENT_ID = 'some-client-id';
      process.env.AUTH0_AUDIENCE = 'some-audience';
      process.env.AUTH0_CLIENT_SECRET = 'some-client-secret';
    }
    describe('AUTH0_ISSUER_URL', () => {
      it('adds a / at the end of the url if there is none', () => {
        setValidEnv();
        process.env.AUTH0_ISSUER_URL = 'http://mock-auth.net';

        expect(authConfig().AUTH0_ISSUER_URL).toEqual('http://mock-auth.net/');
        expect(process.exit).toHaveBeenCalledTimes(0);
        expect(console.log).toHaveBeenCalledTimes(0);
      });

      it('does not add a / at the end of the url if there is one', () => {
        setValidEnv();

        expect(authConfig().AUTH0_ISSUER_URL).toEqual('http://mock-auth.com/');
        expect(process.exit).toHaveBeenCalledTimes(0);
        expect(console.log).toHaveBeenCalledTimes(0);
      });

      it('defaults to `/` if undefined to prevent throwing in the transformation', () => {
        setValidEnv();
        process.env.AUTH0_ISSUER_URL = undefined;

        expect(authConfig().AUTH0_ISSUER_URL).toEqual('/');
      });

      it('throws an error when AUTH0_ISSUER_URL is not a valid URL', () => {
        setValidEnv();
        process.env.AUTH0_ISSUER_URL = 'test';

        authConfig();

        expect(process.exit).toHaveBeenCalledWith(0);
        expect(console.log).toHaveBeenCalledWith(
          '\x1b[31m%s\x1b[0m',
          'AUTH0_ISSUER_URL must be a URL address\n',
        );
      });
    });

    ['AUTH0_CLIENT_ID', 'AUTH0_AUDIENCE', 'AUTH0_CLIENT_SECRET'].forEach(
      (env) => {
        describe(env, () => {
          it(`throws an error when ${env} is empty`, () => {
            setValidEnv();
            delete process.env[env];

            authConfig();

            expect(process.exit).toHaveBeenCalledWith(0);
            expect(console.log).toHaveBeenCalledWith(
              '\x1b[31m%s\x1b[0m',
              `${env} should not be empty\n`,
            );
          });
        });
      },
    );
  });
});
