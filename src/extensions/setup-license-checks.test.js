const extend = require('./setup-license-checks');
const {
  createToolboxMock,
  createExtensionInput,
} = require('../utils/test/mocks');

describe('setup-license-checks', () => {
  let toolbox;

  beforeEach(() => {
    toolbox = createToolboxMock();
    extend(toolbox);
  });

  it('should be defined', () => {
    expect(extend).toBeDefined();
  });

  it('should set setupLicenseChecks on toolbox', () => {
    expect(toolbox.setupLicenseChecks).toBeDefined();
  });

  describe('setupLicenseChecks', () => {
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
          { overwrite: true }
        );
      });
    });
  });
});
