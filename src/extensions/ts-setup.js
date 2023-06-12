'use strict';

module.exports = (toolbox) => {
  toolbox.setupTs = ({ appDir, pkgJson, assetsPath, isExampleApp, build }) => {
    const {
      filesystem: { copyAsync },
      print: { success, muted },
    } = toolbox;

    async function asyncOperations() {
      muted('Configuring TS...');

      const tsconfig = isExampleApp
        ? `${assetsPath}/express/example-app/tsconfig.json`
        : `${assetsPath}/tsconfig.json`;

      await copyAsync(tsconfig, `${appDir}/tsconfig.json`);

      await copyAsync(
        `${assetsPath}/tsconfig.build.json`,
        `${appDir}/tsconfig.build.json`
      );

      success(
        'TS configured successfully. Please wait for the other steps to be completed...'
      );
    }

    function syncOperations() {
      Object.assign(build, {
        dir: 'dist',
      });

      Object.assign(pkgJson.scripts, {
        clean: 'rimraf dist',
        build: 'npm run clean && tsc -p tsconfig.build.json && tsc-alias',
      });

      Object.assign(pkgJson.devDependencies, {
        typescript: '^4.9.5',
        '@tsconfig/recommended': '^1.0.2',
        'tsconfig-paths': '^4.1.2',
        'tsc-alias': '^1.8.2',
        '@types/node': '^18.14.0',
        rimraf: '^4.1.2',
        'ts-node': '^10.9.1',
      });
    }

    return {
      asyncOperations,
      syncOperations,
    };
  };
};
