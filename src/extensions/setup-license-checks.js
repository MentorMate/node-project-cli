'use strict';

module.exports = (toolbox) => {
  toolbox.setupLicenseChecks = ({ assetsPath, appDir, pkgJson }) => {
    const syncOperations = () => {
      Object.assign(pkgJson.scripts, {
        'license:check':
          "license-checker --summary --excludePrivatePackages --onlyAllow $(node ./licenses-allowed.js ';') > /dev/null",
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
        { overwrite: true }
      );
    };

    return {
      syncOperations,
      asyncOperations,
    };
  };
};
