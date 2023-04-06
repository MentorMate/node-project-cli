'use strict';

module.exports = (toolbox) => {
  toolbox.debug = ({
    framework,
    projectLanguage,
    pkgJson,
    assetsPath,
    appDir,
  }) => {
    const {
      filesystem: { copyAsync },
    } = toolbox;

    function syncOperations() {
      if (framework === 'nest') {
        return;
      }

      const debugScript =
        projectLanguage === 'TS'
          ? 'tsc --sourceMap -p tsconfig.build.json && tsc-alias && node --inspect -r dotenv/config dist/index'
          : 'node --inspect -r dotenv/config src/index';

      Object.assign(pkgJson.scripts, {
        'start:debug': debugScript,
      });
    }

    async function asyncOperations() {
      await copyAsync(`${assetsPath}/vscode/`, `${appDir}/.vscode/`);
    }

    return {
      syncOperations,
      asyncOperations,
    };
  };
};
