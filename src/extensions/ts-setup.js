'use strict'

module.exports = (toolbox) => {
  toolbox.setupTs = ({
    appDir,
    moduleType,
    pkgJsonScripts,
    pkgJsonInstalls,
    assetsPath,
    framework,
  }) => {
    const {
      filesystem: { copyAsync, copy, write },
      print: { error, success, muted },
    } = toolbox

    async function asyncOperations() {
      if (framework !== 'nest') {
        muted('Configuring TS...')
        try {
          await copyAsync(
            `${assetsPath}/tsconfig.build.json`,
            `${appDir}/tsconfig.build.json`
          )
        } catch (err) {
          error(
            `An error has occurred while executing TS configuration: ${err}`
          )
        }

        success('TS configured successfully')
      }
    }

    function syncOperations() {
      if (framework !== 'nest') {
        copy(`${assetsPath}/tsconfig.json`, `${appDir}/tsconfig.json`)
        pkgJsonScripts.push({
          ['build']: 'tsc --build',
          ['prepare']: 'npm run build',
        })
        pkgJsonInstalls.push('typescript @tsconfig/recommended')
      }
      const tsConfig = require(`${appDir}/tsconfig.json`)

      if (moduleType === 'ESM') {
        tsConfig.compilerOptions = {
          ...tsConfig.compilerOptions,
          module: 'ES2015',
        }
      }
      write(`${appDir}/tsconfig.json`, tsConfig)
    }

    return {
      asyncOperations,
      syncOperations,
    }
  }
}
