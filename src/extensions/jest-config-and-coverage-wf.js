'use strict';

module.exports = (toolbox) => {
  toolbox.jestConfig = ({
    appDir,
    projectLanguage,
    workflowsFolder,
    pkgJson,
    assetsPath,
    framework,
  }) => {
    const {
      print: { success, muted },
      filesystem: { copyAsync },
    } = toolbox;

    async function asyncOperations() {
      muted('Configuring Jest...');
      try {
        await copyAsync(
          `${assetsPath}/.github/workflows/coverage.yaml`,
          `${workflowsFolder}/coverage.yaml`
        );
        if (framework !== 'nest') {
          const jestConfigFile =
            projectLanguage === 'TS'
              ? `${assetsPath}/jest.config.ts.js`
              : `${assetsPath}/jest.config.vanilla.js`;
          await copyAsync(jestConfigFile, `${appDir}/jest.config.js`);
        }
      } catch (err) {
        throw new Error(
          `An error has occurred while copying jest configuration and workflow: ${err}`
        );
      }

      success(
        'Jest configured successfully. Please wait for the other steps to be completed...'
      );
    }

    function syncOperations() {
      (pkgJson.scripts['test'] = 'jest'),
        Object.assign(pkgJson.devDependencies, {
          jest: '^29.4.2',
          ...(projectLanguage === 'TS' && {
            'ts-jest': '^29.0.5',
            '@types/jest': '^29.4.0',
          }),
        });
    }

    return {
      asyncOperations,
      syncOperations,
    };
  };
};
