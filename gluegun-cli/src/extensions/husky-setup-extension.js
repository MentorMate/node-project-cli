'use strict'

const { filesystem } = require('gluegun')

module.exports = (toolbox) => {
  toolbox.setupHusky = async ({
    appDir,
    assetsPath,
    features,
    pkgJsonScripts,
  }) => {
    const {
      system: { run },
      filesystem: { copy, dir, copyAsync },
    } = toolbox

    const appHuskyPath = `${appDir}/.husky`
    const assetHuskyPath = `${assetsPath}/.husky`

    dir(appHuskyPath)
    pkgJsonScripts.push({
      ['prepare']: 'husky install',
    })

    await Promise.all([
      run(`cd ${appDir} && npm install --save-dev husky`),
      copyAsync(`${assetHuskyPath}/.gitignore`, `${appHuskyPath}/.gitignore`),
    ])

    if (features.includes('commitMsgLint')) {
      pkgJsonScripts.push({
        ['validate:commit-message']: 'commitlint --edit $1',
      })

      await Promise.all([
        run(
          `cd ${appDir} && npm install --save-dev @commitlint/cli @commitlint/config-conventional commitizen cz-conventional-changelog`
        ),
        copyAsync(
          `${assetsPath}/.commitlintrc.js`,
          `${appDir}/.commitlintrc.js`
        ),
        copyAsync(`${assetsPath}/.czrc`, `${appDir}/.czrc`),
        copyAsync(`${assetHuskyPath}/commit-msg`, `${appHuskyPath}/commit-msg`),
      ])
    }

    if (features.includes('preCommit')) {
      dir(`${appDir}/scripts`)

      pkgJsonScripts.push({
        ['initsecrets']: 'scripts/detect-secrets.js',
      })

      await Promise.all([
        run(
          `cd ${appDir} && npm install --save-dev lint-staged shellcheck sort-package-json @ls-lint/ls-lint`
        ),
        copyAsync(`${assetHuskyPath}/pre-commit`, `${appHuskyPath}/pre-commit`),
        copyAsync(`${assetsPath}/.lintstagedrc`, `${appDir}/.lintstagedrc`),
        copyAsync(`${assetsPath}/.ls-lint.yml`, `${appDir}/.ls-lint.yml`),
        copyAsync(
          `${assetsPath}/.pre-commit-config.yaml`,
          `${appDir}/.pre-commit-config.yaml`
        ),
        copyAsync(
          `${assetsPath}/detect-secrets.sh`,
          `${appDir}/scripts/detect-secrets.sh`
        ),
      ])
    }

    if (features.includes('prePush')) {
      copy(`${assetHuskyPath}/pre-push`, `${appHuskyPath}/pre-push`)
    }
  }
}
