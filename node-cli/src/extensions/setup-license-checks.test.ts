import extend from './setup-license-checks';
import { createToolboxMock, createExtensionInput } from '../utils/test/mocks';
import {
  MockToolbox,
  Operations,
  SampleExtensionInput,
} from '../utils/test/types';

describe('setup-license-checks', () => {
  let toolbox: MockToolbox;

  beforeEach(() => {
    toolbox = createToolboxMock();
    extend(toolbox as any);
  });

  it('should be defined', () => {
    expect(extend).toBeDefined();
  });

  it('should set setupLicenseChecks on toolbox', () => {
    expect(toolbox.setupLicenseChecks).toBeDefined();
  });

  describe('setupLicenseChecks', () => {
    let input: SampleExtensionInput;
    let ops: Operations;

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
      let scripts: Record<string, string>;
      let devDependencies: Record<string, string>;

      beforeEach(() => {
        toolbox.setupLicenseChecks(input).syncOperations();
        scripts = input.pkgJson.scripts;
        devDependencies = input.pkgJson.devDependencies;
      });

      it('should add a license:check script', () => {
        expect(scripts).toHaveProperty('license:check');
      });

      it('should add a license:for-review script', () => {
        expect(scripts).toHaveProperty('license:for-review');
      });

      it('should add a license:summary script', () => {
        expect(scripts).toHaveProperty('license:summary');
      });

      it('should add license-checker to devDependencies', () => {
        expect(devDependencies).toHaveProperty('license-checker');
      });

      it('should add spdx-license-list devDependencies', () => {
        expect(devDependencies).toHaveProperty('spdx-license-list');
      });
    });

    describe('asyncOperations', () => {
      beforeEach(async () => {
        toolbox.filesystem.copyAsync = jest.fn(() => {});
        await toolbox.setupLicenseChecks(input).asyncOperations();
      });

      it('should copy the licenses assets dir', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/licenses/`,
          `${input.appDir}/`,
          { overwrite: true },
        );
      });
    });
  });
});
