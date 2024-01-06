const extend = require('./husky-setup-extension');
const {
  createToolboxMock,
  createExtensionInput,
} = require('../utils/test/mocks');

describe('husky-setup-extension', () => {
  let toolbox;

  beforeEach(() => {
    toolbox = createToolboxMock();
    extend(toolbox);
  });

  it('should be defined', () => {
    expect(extend).toBeDefined();
  });

  it('should set setupHusky on toolbox', () => {
    expect(toolbox.setupHusky).toBeDefined();
  });

  describe('setupHusky', () => {
    let input;
    let ops;

    beforeAll(() => {
      input = createExtensionInput();
    });

    beforeEach(() => {
      ops = toolbox.setupHusky(input);
    });

    it('should return syncOperations and asyncOperations when the extension is called', () => {
      expect(ops.syncOperations).toBeDefined();
      expect(ops.asyncOperations).toBeDefined();
    });

    describe('syncOperations', () => {
      let scripts;
      let devDependencies;

      beforeAll(() => {
        input.features = [];
        input.db = 'pg';
      });

      beforeEach(() => {
        ops.syncOperations();
        scripts = input.pkgJson.scripts;
        devDependencies = input.pkgJson.devDependencies;
      });

      it('should add a prepare script which builds the app', () => {
        expect(scripts['prepare']).toBe('husky install');
      });

      it('should add the husky package', () => {
        expect(devDependencies).toHaveProperty('husky');
      });

      describe('when the features include commit hook', () => {
        beforeAll(() => {
          input.features = ['commitMsgLint'];
        });

        it('should add the commitlint package', () => {
          expect(devDependencies).toHaveProperty('commitlint');
        });

        it('should add the @commitlint/config-conventional package', () => {
          expect(devDependencies).toHaveProperty(
            '@commitlint/config-conventional'
          );
        });

        it('should add the commitizen package', () => {
          expect(devDependencies).toHaveProperty('commitizen');
        });

        it('should add the cz-conventional-changelog package', () => {
          expect(devDependencies).toHaveProperty('cz-conventional-changelog');
        });
      });

      describe('when the features include pre commit', () => {
        beforeAll(() => {
          input.features = ['preCommit'];
        });

        it('should add the lint-staged package', () => {
          expect(devDependencies).toHaveProperty('lint-staged');
        });

        it('should add the sort-package-json package', () => {
          expect(devDependencies).toHaveProperty('sort-package-json');
        });

        it('should add the @ls-lint/ls-lint package', () => {
          expect(devDependencies).toHaveProperty('@ls-lint/ls-lint');
        });

        describe('and the OS is not Windows', () => {
          beforeEach(() => {
            delete input.pkgJson.devDependencies['shellcheck'];
            toolbox.os.isWin = jest.fn(() => false);
            toolbox.setupHusky(input).syncOperations();
            devDependencies = input.pkgJson.devDependencies;
          });

          it('should add the shellcheck package', () => {
            expect(devDependencies).toHaveProperty('shellcheck');
          });
        });

        describe('and the OS is Windows', () => {
          beforeEach(() => {
            delete input.pkgJson.devDependencies['shellcheck'];
            toolbox.os.isWin = jest.fn(() => true);
            toolbox.setupHusky(input).syncOperations();
            devDependencies = input.pkgJson.devDependencies;
          });

          it('should not add the shellcheck package', () => {
            expect(devDependencies).not.toHaveProperty('shellcheck');
          });
        });
      });
    });

    describe('asyncOperations', () => {
      let assetsPath;
      let appDir;
      let appHuskyPath;
      let assetHuskyPath;

      beforeAll(() => {
        assetsPath = input.assetsPath;
        appDir = input.appDir;
        appHuskyPath = `${appDir}/.husky`;
        assetHuskyPath = `${assetsPath}/.husky`;
        input.features = [];
      });

      beforeEach(() => {
        toolbox.print.muted = jest.fn(() => {});
        toolbox.print.success = jest.fn(() => {});
        toolbox.print.error = jest.fn(() => {});
        toolbox.filesystem.dir = jest.fn(() => {});
        toolbox.filesystem.read = jest.fn(() => ({}));
        toolbox.filesystem.copyAsync = jest.fn(() => {});
        toolbox.filesystem.writeAsync = jest.fn(() => {});
        toolbox.template.generate = jest.fn(() => Promise.resolve(''));
        toolbox.system.run = jest.fn(() => {});
      });

      beforeEach(async () => {
        await toolbox.setupHusky(input).asyncOperations();
      });

      it('should print a muted and a success message', () => {
        expect(toolbox.print.muted).toHaveBeenCalledTimes(1);
        expect(toolbox.print.success).toHaveBeenCalledTimes(1);
        expect(toolbox.print.error).not.toHaveBeenCalled();
      });

      it('should create a .husky directory', () => {
        expect(toolbox.filesystem.dir).toHaveBeenCalledWith(appHuskyPath);
      });

      it('should copy the husky .gitignore', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${assetHuskyPath}/gitignorefile`,
          `${appHuskyPath}/.gitignore`
        );
      });

      describe('when the features include commitMsgLint', () => {
        beforeAll(async () => {
          input.features = ['commitMsgLint'];
        });

        it('should copy the commit lint config file', () => {
          expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
            `${assetsPath}/.commitlintrc.js`,
            `${appDir}/.commitlintrc.js`
          );
        });

        it('should copy the Commitzen config file', () => {
          expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
            `${assetsPath}/.czrc`,
            `${appDir}/.czrc`
          );
        });

        it('should copy the commit msg hook', () => {
          expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
            `${assetHuskyPath}/commit-msg`,
            `${appHuskyPath}/commit-msg`
          );
        });
      });

      describe('when the features include preCommit', () => {
        beforeAll(async () => {
          input.features = ['preCommit'];
        });

        it('should create a scripts directory', () => {
          expect(toolbox.filesystem.dir).toHaveBeenCalledWith(
            `${appDir}/scripts`
          );
        });

        it('should copy the pre-commit hook', () => {
          expect(toolbox.template.generate).toHaveBeenCalledWith({
            template: 'husky/pre-commit.ejs',
            target: `${appDir}/.husky/pre-commit`,
            props: expect.any(Object),
          });

          expect(toolbox.system.run).toHaveBeenCalledWith(
            `chmod +x ${appDir}/.husky/pre-commit`
          );
        });

        it('should write the lintstaged config', () => {
          expect(toolbox.filesystem.writeAsync).toHaveBeenCalledWith(
            `${appDir}/.lintstagedrc`,
            {}
          );
        });

        it('should copy the ls-lint config', () => {
          expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
            `${assetsPath}/.ls-lint.yml`,
            `${appDir}/.ls-lint.yml`
          );
        });

        describe('and it is the example app', () => {
          beforeAll(() => {
            input.isExampleApp = true;
          });

          afterAll(() => {
            input.isExampleApp = false;
          });

          describe('and the fraemwork is nest', () => {
            beforeAll(() => {
              input.framework = 'nest';
            });

            it('should copy the example app ls-lint config', () => {
              expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
                `${assetsPath}/${input.framework}/example-app-pg/.ls-lint.yml`,
                `${appDir}/.ls-lint.yml`
              );
            });
          });

          describe('and the framework is express', () => {
            beforeAll(() => {
              input.framework = 'express';
            });

            it('should copy the example app ls-lint config', () => {
              expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
                `${assetsPath}/${input.framework}/example-app/.ls-lint.yml`,
                `${appDir}/.ls-lint.yml`
              );
            });
          });
        });

        it('should copy the detect-secrets script', () => {
          expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
            `${assetsPath}/detect-secrets.sh`,
            `${appDir}/scripts/detect-secrets.sh`
          );
        });

        it('should copy the secrets baseline file', () => {
          expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
            `${assetsPath}/.secrets.baseline`,
            `${appDir}/.secrets.baseline`
          );
        });
      });

      describe('when the features include prePush', () => {
        beforeAll(async () => {
          input.features = ['prePush'];
        });

        it('should copy the pre-push hook', () => {
          expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
            `${assetHuskyPath}/pre-push`,
            `${appHuskyPath}/pre-push`
          );
        });
      });

      describe('when an error is thrown', () => {
        const error = new Error('the-error');

        beforeEach(async () => {
          toolbox.filesystem.copyAsync = jest.fn(() => {
            throw error;
          });
        });

        it('should rethrow the error with an added user-friendly message', () => {
          expect(toolbox.setupHusky(input).asyncOperations()).rejects.toThrow(
            `An error has occurred while creating husky hooks: ${error}`
          );
        });
      });
    });
  });
});
