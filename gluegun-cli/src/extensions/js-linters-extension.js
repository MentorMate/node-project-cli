'use strict'

module.exports = (toolbox) => {
  toolbox.jsLinters = async ({
    appDir,
    projectLanguage,
    moduleType,
    pkgJsonScripts,
    assetsPath,
  }) => {
    const {
      system,
      template: { generate },
      filesystem: { copyAsync },
    } = toolbox

    await Promise.all([
      system.run(
        `cd ${appDir} && npm install --save-dev prettier eslint eslint-config-prettier eslint-config-google @typescript-eslint/eslint-plugin @typescript-eslint/parser`
      ),
      generate({
        template: 'eslintrc-model.js.ejs',
        target: `${appDir}/.eslintrc.js`,
        props: {
          ts: projectLanguage == 'TS',
          cjs: moduleType == 'CJS',
        },
      }),
      generate({
        template: 'prettierrc-model.js.ejs',
        target: `${appDir}/.prettierrc.js`,
      }),
      copyAsync(`${assetsPath}/.eslintignore`, `${appDir}/.eslintignore`),
      copyAsync(`${assetsPath}/.prettierignore`, `${appDir}/.prettierignore`),
    ])

    const lintScript =
      projectLanguage == 'TS' ? 'eslint . --ext .js .ts' : 'eslint . --ext .js'

    pkgJsonScripts.push({
      ['prettier:format']: 'prettier --write',
      ['prettier:check-format']: 'prettier --list-different',
      ['lint']: lintScript,
      ['lint:fix']: 'npm run lint --fix',
    })
  }
}
