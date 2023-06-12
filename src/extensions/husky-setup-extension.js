'use strict';

module.exports = (toolbox) => {
  toolbox.setupHusky = ({
    appDir,
    assetsPath,
    features,
    pkgJson,
    projectLanguage,
    isExampleApp,
  }) => {
    const {
      filesystem: { dir, copyAsync, read, writeAsync },
      print: { success, muted },
      template: { generate },
      system: { run },
      os,
    } = toolbox;

    const appHuskyPath = `${appDir}/.husky`;
    const assetHuskyPath = `${assetsPath}/.husky`;

    async function asyncOperations() {
      const lintstagedrc = read(`${assetsPath}/.lintstagedrc`, 'json');

      /*
        We need to delete the *.sh option on windows since
        the package we use - shellcheck doesn't support windows
      */
      if (os.isWin()) {
        delete lintstagedrc['*.sh'];
      }

      // TODO: use a template instead
      if (features.includes('markdownLinter')) {
        lintstagedrc['*.md'] ||= [];
        lintstagedrc['*.md'].push('markdownlint --fix');
      }

      muted('Creating Husky hooks...');

      try {
        dir(appHuskyPath);

        await copyAsync(
          `${assetHuskyPath}/gitignorefile`,
          `${appHuskyPath}/.gitignore`
        );

        if (features.includes('commitMsgLint')) {
          await Promise.all([
            copyAsync(
              `${assetsPath}/.commitlintrc.js`,
              `${appDir}/.commitlintrc.js`
            ),
            copyAsync(`${assetsPath}/.czrc`, `${appDir}/.czrc`),
            copyAsync(
              `${assetHuskyPath}/commit-msg`,
              `${appHuskyPath}/commit-msg`
            ),
          ]);
        }

        if (features.includes('preCommit')) {
          dir(`${appDir}/scripts`);

          await Promise.all([
            generate({
              template: 'husky/pre-commit.ejs',
              target: `${appDir}/.husky/pre-commit`,
              props: {
                ts: projectLanguage === 'TS',
                dockerized: features.includes('containerization'),
                licenseChecks: features.includes('licenseChecks'),
                test: {
                  unit: true,
                  e2e: true,
                },
              },
            }).then(() => {
              run(`chmod +x ${appDir}/.husky/pre-commit`);
            }),
            writeAsync(`${appDir}/.lintstagedrc`, lintstagedrc),
            copyAsync(
              isExampleApp
                ? `${assetsPath}/express/example-app/.ls-lint.yml`
                : `${assetsPath}/.ls-lint.yml`,
              `${appDir}/.ls-lint.yml`
            ),
            copyAsync(
              `${assetsPath}/.pre-commit-config.yaml`,
              `${appDir}/.pre-commit-config.yaml`
            ),
            copyAsync(
              `${assetsPath}/detect-secrets.sh`,
              `${appDir}/scripts/detect-secrets.sh`
            ),
            copyAsync(
              `${assetsPath}/.secrets.baseline`,
              `${appDir}/.secrets.baseline`
            ),
          ]);
        }

        if (features.includes('prePush')) {
          await copyAsync(
            `${assetHuskyPath}/pre-push`,
            `${appHuskyPath}/pre-push`
          );
        }
      } catch (err) {
        throw new Error(
          `An error has occurred while creating husky hooks: ${err}`
        );
      }

      success(
        'Husky hooks created successfully. Please wait for the other steps to be completed...'
      );
    }

    function syncOperations() {
      pkgJson.scripts['prepare'] = 'husky install';
      pkgJson.devDependencies['husky'] = '^8.0.3';

      if (features.includes('commitMsgLint')) {
        Object.assign(pkgJson.devDependencies, {
          commitlint: '^17.4.3',
          '@commitlint/config-conventional': '^17.4.3',
          commitizen: '^4.3.0',
          'cz-conventional-changelog': '^3.3.0',
        });
      }

      if (features.includes('preCommit')) {
        Object.assign(pkgJson.devDependencies, {
          'lint-staged': '^13.1.2',
          'sort-package-json': '^2.4.1',
          '@ls-lint/ls-lint': '^1.11.2',
          ...(!os.isWin() && {
            shellcheck: '^2.2.0',
          }),
        });
      }
    }

    return {
      asyncOperations,
      syncOperations,
    };
  };
};
