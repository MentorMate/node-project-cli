const extend = require('./install-framework');
const {
  createToolboxMock,
  createExtensionInput,
} = require('../utils/test/mocks');

describe('install-framework', () => {
  let toolbox;

  beforeEach(() => {
    toolbox = createToolboxMock();
    extend(toolbox);
  });

  it('should be defined', () => {
    expect(extend).toBeDefined();
  });

  it('should set installFramework on toolbox', () => {
    expect(toolbox.installFramework).toBeDefined();
  });

  describe('installFramework', () => {
    const input = createExtensionInput();
    let envVars;
    let scripts;
    let dependencies;
    let devDependencies;

    beforeAll(() => {
      input.framework = 'fastify'; // else-branch coverage
      input.projectLanguage = 'JS';
    });

    beforeEach(() => {
      toolbox.print.muted = jest.fn(() => {});
      toolbox.print.success = jest.fn(() => {});
      toolbox.print.error = jest.fn(() => {});
      toolbox.filesystem.dir = jest.fn(() => {});
      toolbox.filesystem.copyAsync = jest.fn(() => {});
      toolbox.template.generate = jest.fn(() => {});
      toolbox.system.run = jest.fn(() => {});
      toolbox.installFramework(input);
      envVars = input.envVars;
      scripts = input.pkgJson.scripts;
      dependencies = input.pkgJson.dependencies;
      devDependencies = input.pkgJson.devDependencies;
    });

    it('should print a muted and a success message', async () => {
      expect(toolbox.print.muted).toHaveBeenCalledTimes(1);
      expect(toolbox.print.success).toHaveBeenCalledTimes(1);
      expect(toolbox.print.error).not.toHaveBeenCalled();
    });

    it('should add the HTTP env var section', () => {
      expect(envVars).toHaveProperty('HTTP');
      expect(envVars['HTTP']).toHaveProperty('PORT');
    });

    it('should install add the framework to dependencies', () => {
      expect(dependencies).toHaveProperty(input.framework);
    });

    it('should install add dotenv to devDependencies', () => {
      expect(devDependencies).toHaveProperty('dotenv');
    });

    it('should install add nodemon to devDependencies', () => {
      expect(devDependencies).toHaveProperty('dotenv');
    });

    it('should add the start script', () => {
      expect(scripts).toHaveProperty('start');
    });

    it('should add the start:dev script', () => {
      expect(scripts).toHaveProperty('start:dev');
    });

    it('should generate a nodemon.json file', () => {
      expect(toolbox.template.generate).toHaveBeenCalledWith({
        template: 'nodemon/nodemon.json.ejs',
        target: `${input.appDir}/nodemon.json`,
        props: {
          ext: input.projectLanguage === 'TS' ? 'ts' : 'js',
          exec: input.pkgJson.scripts['start'],
        },
      });
    });

    describe('when the language is TypeScript', () => {
      beforeAll(() => {
        input.projectLanguage = 'TS';
      });

      it('should add the start:debug script', () => {
        expect(scripts).toHaveProperty('start:debug');
      });

      it('should copy the vscode folder', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/vscode/`,
          `${input.appDir}/.vscode/`
        );
      });
    });

    describe('when the framework is express', () => {
      beforeAll(() => {
        input.projectLanguage = 'JS'; // else-branch coverage
        input.framework = 'express';
      });

      it('should add helmet to dependencies', () => {
        expect(dependencies).toHaveProperty('helmet');
      });

      it('should add cors to dependencies', () => {
        expect(dependencies).toHaveProperty('cors');
      });

      it('should add compression to dependencies', () => {
        expect(dependencies).toHaveProperty('compression');
      });

      it('should add http-terminator to dependencies', () => {
        expect(dependencies).toHaveProperty('http-terminator');
      });

      it('should add pino to dependencies', () => {
        expect(dependencies).toHaveProperty('pino');
      });

      it('should add http-errors to dependencies', () => {
        expect(dependencies).toHaveProperty('http-errors');
      });

      describe('and the language is TypeScript', () => {
        beforeAll(() => {
          input.projectLanguage = 'TS';
        });

        it('should copy the example express project source', () => {
          expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
            `${input.assetsPath}/express/src/`,
            `${input.appDir}/src/`,
            { overwrite: true }
          );
        });

        it('should add zod to dependencies', () => {
          expect(dependencies).toHaveProperty('zod');
        });

        it('should add query types to dependencies', () => {
          expect(dependencies).toHaveProperty('query-types');
        });

        it('should add @asteasolutions/zod-to-openapi to dependencies', () => {
          expect(dependencies).toHaveProperty('@asteasolutions/zod-to-openapi');
        });

        it('should add statuses to dependencies', () => {
          expect(dependencies).toHaveProperty('statuses');
        });

        it('should add @types/express to devDependencies', () => {
          expect(devDependencies).toHaveProperty('@types/express');
        });

        it('should add @types/cors to devDependencies', () => {
          expect(devDependencies).toHaveProperty('@types/cors');
        });

        it('should add @types/compression to devDependencies', () => {
          expect(devDependencies).toHaveProperty('@types/compression');
        });

        it('should add pino-pretty to devDependencies', () => {
          expect(devDependencies).toHaveProperty('pino-pretty');
        });

        it('should add @types/statuses to devDependencies', () => {
          expect(devDependencies).toHaveProperty('@types/statuses');
        });

        it('should add the OpenAPI env var section', () => {
          expect(envVars).toHaveProperty('OpenAPI');
          expect(envVars['OpenAPI']).toHaveProperty('SWAGGER_UI_PORT');
        });

        it('should add the openapi scripts', () => {
          expect(Object.keys(scripts)).toEqual(
            expect.arrayContaining([
              'openapi:g',
              'openapi:ui:run',
              'openapi:ui:open',
              'openapi:serve',
            ])
          );
        });

        it('should add concurrently to devDependencies', () => {
          expect(devDependencies).toHaveProperty('concurrently');
        });

        it('should add open to devDependencies', () => {
          expect(devDependencies).toHaveProperty('open');
        });

        it('should copy the openapi-generate script', () => {
          expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
            `${input.assetsPath}/express/scripts`,
            `${input.appDir}/scripts`,
            { overwrite: true }
          );
        });

        it('should copy the .openapi dir', () => {
          expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
            `${input.assetsPath}/express/.openapi`,
            `${input.appDir}/.openapi`
          );
        });

        describe('and the database is PostgreSQL', () => {
          beforeAll(() => {
            input.db = 'pg';
          });

          it('should add Knex to envVars', () => {
            expect(envVars).toHaveProperty('Knex');
          });

          it('should add knex to dependencies', () => {
            expect(dependencies).toHaveProperty('knex');
          });

          it('should add pg-error-enum to dependencies', () => {
            expect(dependencies).toHaveProperty('pg-error-enum');
          });

          it('shoudl add knex migration scripts', () => {
            expect(Object.keys(scripts)).toEqual(
              expect.arrayContaining([
                'db:connection:print',
                'db:migrate:make',
                'db:migrate:up',
                'db:migrate:down',
                'db:migrate:latest',
                'db:migrate:rollback',
                'db:migrate:version',
                'db:migrate:status',
                'db:migrate:reset',
              ])
            );
          });

          it('should copy the pg scripts', () => {
            expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
              `${input.assetsPath}/db/pg/scripts`,
              `${input.appDir}/scripts`,
              { overwrite: true }
            );
          });
        });
      });
    });

    it('should render the README template', () => {
      expect(toolbox.template.generate).toHaveBeenCalledWith({
        template: 'README.md.ejs',
        target: `${input.appDir}/README.md`,
        props: expect.anything(),
      });
    });
  });
});
