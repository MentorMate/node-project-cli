'use strict'

module.exports = (toolbox) => {
  toolbox.setupHusky = ({
    appDir,
    projectLanguage,
    assetsPath,
    features,
    pkgJsonScripts,
    pkgJsonInstalls,
  }) => {
    const {
      filesystem: { dir, copyAsync },
      print: { success, muted },
    } = toolbox

    const appHuskyPath = `${appDir}/.husky`
    const assetHuskyPath = `${assetsPath}/.husky`

    async function asyncOperations() {
      muted('Creating Husky hooks...')
      try {
        dir(appHuskyPath)

        await copyAsync(
          `${assetHuskyPath}/.project-gitignr`,
          `${appHuskyPath}/.gitignore`
        )

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
          ])
        }

        if (features.includes('preCommit')) {
          dir(`${appDir}/scripts`)

          await Promise.all([
            copyAsync(
              `${assetHuskyPath}/pre-commit`,
              `${appHuskyPath}/pre-commit`
            ),
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
            copyAsync(
              `${assetsPath}/.secrets.baseline`,
              `${appDir}/.secrets.baseline`
            ),
          ])
        }

        if (features.includes('prePush')) {
          await copyAsync(
            `${assetHuskyPath}/pre-push`,
            `${appHuskyPath}/pre-push`
          )
        }
      } catch (err) {
        throw new Error(`An error has occurred while creating husky hooks: ${err}`)
      }

      success('Husky hooks created successfully')
    }

    function syncOperations() {
      const prepareScript =
        projectLanguage === 'TS'
          ? 'husky install && npm run build'
          : 'husky install'
      pkgJsonScripts.push({
        ['prepare']: prepareScript,
      })
      pkgJsonInstalls.push('husky')

      if (features.includes('commitMsgLint')) {
        pkgJsonScripts.push({
          ['validate:commit-message']: 'commitlint --edit $1',
        })
        pkgJsonInstalls.push(
          '@commitlint/cli @commitlint/config-conventional commitizen cz-conventional-changelog'
        )
      }

      if (features.includes('preCommit')) {
        pkgJsonScripts.push({
          ['initsecrets']: 'scripts/detect-secrets.sh',
        })
        pkgJsonInstalls.push(
          'lint-staged shellcheck sort-package-json @ls-lint/ls-lint'
        )
      }
    }

    return {
      asyncOperations,
      syncOperations,
    }
  }
}
