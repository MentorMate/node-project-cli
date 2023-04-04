'use strict';

module.exports = (toolbox) => {
  toolbox.setupTs = ({ appDir, pkgJson, assetsPath, framework }) => {
    const {
      filesystem: { copyAsync, copy },
      print: { success, muted },
    } = toolbox;

    async function asyncOperations() {
      if (framework !== 'nest') {
        muted('Configuring TS...');
        try {
          await copyAsync(
            `${assetsPath}/tsconfig.build.json`,
            `${appDir}/tsconfig.build.json`
          );
        } catch (err) {
          throw new Error(
            `An error has occurred while executing TS configuration: ${err}`
          );
        }

        success(
          'TS configured successfully. Please wait for the other steps to be completed...'
        );
      }
    }

    function syncOperations() {
      if (framework !== 'nest') {
        copy(`${assetsPath}/tsconfig.json`, `${appDir}/tsconfig.json`);

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
    }

    return {
      asyncOperations,
      syncOperations,
    };
  };
};
