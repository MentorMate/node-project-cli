import { GluegunToolbox } from 'gluegun';
import { UserInput } from '../@types';

export default (toolbox: GluegunToolbox) => {
  toolbox.setupLicenseChecks = ({ assetsPath, appDir, pkgJson }: UserInput) => {
    const syncOperations = () => {
      Object.assign(pkgJson.scripts, {
        'license:check':
          "license-checker --summary --excludePrivatePackages --onlyAllow $(node ./licenses-allowed.js ';')",
        'license:for-review':
          "license-checker --summary --excludePrivatePackages --exclude $(node ./licenses-allowed.js ',')",
        'license:summary': 'license-checker --summary',
      });

      Object.assign(pkgJson.devDependencies, {
        'license-checker': '^25.0.1',
        'spdx-license-list': '^6.6.0',
      });
    };

    const asyncOperations = async () => {
      await toolbox.filesystem.copyAsync(
        `${assetsPath}/licenses/`,
        `${appDir}/`,
        { overwrite: true },
      );
    };

    return {
      syncOperations,
      asyncOperations,
    };
  };
};
