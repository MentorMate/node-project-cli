'use strict';

module.exports = (toolbox) => {
  toolbox.jsLinters = ({
    appDir,
    projectLanguage,
    moduleType,
    pkgJsonScripts,
    pkgJsonInstalls,
    assetsPath,
  }) => {
    const {
      template: { generate },
      filesystem: { copyAsync },
      print: { success, muted },
    } = toolbox;

    async function asyncOperations() {
      muted('Configuring JS linters...');
      try {
        await Promise.all([
          generate({
            template: 'eslintrc-model.js.ejs',
            target: `${appDir}/.eslintrc.js`,
            props: {
              ts: projectLanguage === 'TS',
              cjs: moduleType === 'CJS',
            },
          }),
          copyAsync(`${assetsPath}/.eslintignore`, `${appDir}/.eslintignore`),
          copyAsync(`${assetsPath}/.prettierrc.js`, `${appDir}/.prettierrc.js`),
          copyAsync(
            `${assetsPath}/.prettierignore`,
            `${appDir}/.prettierignore`
          ),
        ]);
      } catch (err) {
        throw new Error(
          `An error has occurred while executing JS linters configuration: ${err}`
        );
      }

      success(
        'JS linters configured successfully. Please wait for the other steps to be completed...'
      );
    }

    function syncOperations() {
      const lintScript =
        projectLanguage === 'TS'
          ? 'eslint . --ext .js,.cjs,.mjs,.ts --fix --cache'
          : 'eslint . --ext .js,.cjs,.mjs --fix --cache';

      pkgJsonScripts.push({
        ['format']:
          'prettier "**/*.js" --write --cache --cache-strategy metadata --cache-location .prettiercache',
        ['lint']: lintScript,
      });
      pkgJsonInstalls.push('prettier eslint eslint-config-prettier');
      if (projectLanguage === 'TS') {
        pkgJsonInstalls.push(
          '@typescript-eslint/eslint-plugin @typescript-eslint/parser'
        );
      }
    }

    return {
      asyncOperations,
      syncOperations,
    };
  };
};
