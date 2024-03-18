import extend from './ts-setup';
import { createToolboxMock, createExtensionInput } from '../utils/test/mocks';
import { MockToolbox, Operations } from '../utils/test/types';
import { Framework } from '../@types';

describe('ts-setup', () => {
  let toolbox: MockToolbox;

  beforeEach(() => {
    toolbox = createToolboxMock();
    extend(toolbox as any);
  });

  it('should be defined', () => {
    expect(extend).toBeDefined();
  });

  it('should set setupTs on toolbox', () => {
    expect(toolbox.setupTs).toBeDefined();
  });

  describe('setupTs', () => {
    const input = createExtensionInput();
    let ops: Operations;

    beforeEach(() => {
      ops = toolbox.setupTs(input);
    });

    it('should return syncOperations and asyncOperations when the extension is called', () => {
      expect(ops.syncOperations).toBeDefined();
      expect(ops.asyncOperations).toBeDefined();
    });

    describe('syncOperations', () => {
      let scripts: Record<string, string>;
      let devDependencies: Record<string, string>;

      beforeAll(() => {
        input.framework = Framework.EXPRESS;
        input.pkgJsonScripts = [];
        input.pkgJsonInstalls = [];
      });

      beforeEach(() => {
        toolbox.filesystem.copy = jest.fn(() => {});
        toolbox.filesystem.read = jest.fn(() =>
          JSON.stringify({ compilerOptions: {} }),
        );
        toolbox.filesystem.write = jest.fn(() => {});
        toolbox.setupTs(input).syncOperations();
        scripts = input.pkgJson.scripts;
        devDependencies = input.pkgJson.devDependencies;
      });

      it('should add a clean script', () => {
        expect(scripts['clean']).toBeDefined();
      });

      it('should add a build script', () => {
        expect(scripts['build']).toBeDefined();
      });

      it('should add the typescript devDependency', () => {
        expect(devDependencies).toHaveProperty('typescript');
      });

      it('should add the @tsconfig/recommended devDependency', () => {
        expect(devDependencies).toHaveProperty('@tsconfig/recommended');
      });

      it('should add the tsconfig-paths devDependency', () => {
        expect(devDependencies).toHaveProperty('tsconfig-paths');
      });

      it('should add the tsc-alias devDependency', () => {
        expect(devDependencies).toHaveProperty('tsc-alias');
      });

      it('should add the @types/node devDependency', () => {
        expect(devDependencies).toHaveProperty('@types/node');
      });

      it('should add the rimraf devDependency', () => {
        expect(devDependencies).toHaveProperty('rimraf');
      });

      it('should add the ts-node devDependency', () => {
        expect(devDependencies).toHaveProperty('ts-node');
      });
    });

    describe('asyncOperations', () => {
      beforeAll(() => {
        input.framework = Framework.EXPRESS;
      });

      beforeEach(async () => {
        toolbox.print.muted = jest.fn(() => {});
        toolbox.print.success = jest.fn(() => {});
        toolbox.print.error = jest.fn(() => {});
        toolbox.filesystem.copyAsync = jest.fn(() => {});
        await toolbox.setupTs(input).asyncOperations();
      });

      it('should print a muted and a success message', () => {
        expect(toolbox.print.muted).toHaveBeenCalledTimes(1);
        expect(toolbox.print.success).toHaveBeenCalledTimes(1);
        expect(toolbox.print.error).not.toHaveBeenCalled();
      });

      describe('when it is the example app', () => {
        beforeAll(() => {
          input.isExampleApp = true;
        });

        it('should copy the tsconfig file', () => {
          expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
            `${input.assetsPath}/express/example-app/tsconfig.json`,
            `${input.appDir}/tsconfig.json`,
          );
        });
      });

      describe('when it is not the example app', () => {
        beforeAll(() => {
          input.isExampleApp = false;
        });

        it('should copy the tsconfig file', () => {
          expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
            `${input.assetsPath}/tsconfig.json`,
            `${input.appDir}/tsconfig.json`,
          );
        });
      });

      it('should copy the tsconfig build file', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/tsconfig.build.json`,
          `${input.appDir}/tsconfig.build.json`,
        );
      });
    });
  });
});
