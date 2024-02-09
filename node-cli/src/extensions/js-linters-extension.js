'use strict';

module.exports = (toolbox) => {
  toolbox.jsLinters = ({
    appDir,
    projectLanguage,
    pkgJson,
    assetsPath,
    framework,
  }) => {
    const {
      template: { generate },
      filesystem: { copyAsync },
      print: { success, muted },
    } = toolbox;

    async function asyncOperations() {
      muted('Configuring JS linters...');

      try {
        if (framework !== 'nest') {
          await Promise.all([
            generate({
              template: 'eslintrc-model.js.ejs',
              target: `${appDir}/.eslintrc.js`,
              props: {
                ts: projectLanguage === 'TS',
              },
            }),
            copyAsync(
              `${assetsPath}/.prettierrc.js`,
              `${appDir}/.prettierrc.js`
            ),
          ]);
        }

        await Promise.all([
          copyAsync(`${assetsPath}/.eslintignore`, `${appDir}/.eslintignore`),
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
      if (framework === 'nest') {
        return;
      }

      const ext = ['js', 'cjs', 'mjs'];

      if (projectLanguage === 'TS') {
        ext.push('ts');
      }

      const formatExt = [...ext, 'md'].join(',');
      const lintExt = ext.map((e) => `.${e}`).join(',');

      Object.assign(pkgJson.scripts, {
        format: `prettier "**/*.{${formatExt}}" --write --cache --cache-strategy metadata --cache-location .prettiercache`,
        lint: `eslint . --ext ${lintExt} --fix --cache`,
      });

      Object.assign(pkgJson.devDependencies, {
        prettier: '^2.8.4',
        eslint: '^8.34.0',
        'eslint-plugin-security': '~1.7.1',
        'eslint-config-prettier': '^8.6.0',
        ...(projectLanguage === 'TS' && {
          '@typescript-eslint/eslint-plugin': '^5.52.0',
          '@typescript-eslint/parser': '^5.52.0',
        }),
      });
    }

    return {
      asyncOperations,
      syncOperations,
    };
  };
};
