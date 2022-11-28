'use strict'

module.exports = (toolbox) => {
  toolbox.jestConfig = ({
    appDir,
    projectLanguage,
    workflowsFolder,
    pkgJsonScripts,
    pkgJsonInstalls,
    assetsPath,
    framework,
  }) => {
    const {
      print: { success, muted },
      filesystem: { copyAsync },
    } = toolbox

    async function asyncOperations() {
      muted('Configuring Jest...')
      try {
        await copyAsync(
          `${assetsPath}/.github/workflows/coverage.yaml`,
          `${workflowsFolder}/coverage.yaml`
        )
        if (framework !== 'nest') {
          const jestConfigFile =
            projectLanguage === 'TS'
              ? `${assetsPath}/jest.config.ts.js`
              : `${assetsPath}/jest.config.vanilla.js`
          await copyAsync(jestConfigFile, `${appDir}/jest.config.js`)
        }
      } catch (err) {
        throw new Error(
          `An error has occurred while copying jest configuration and workflow: ${err}`
        )
      }

      success('Jest configured successfully')
    }

    function syncOperations() {
      pkgJsonScripts.push({
        ['test']: 'jest',
      })
      pkgJsonInstalls.push('jest')
      if (projectLanguage === 'TS') {
        pkgJsonInstalls.push('ts-jest @types/jest')
      }
    }

    return {
      asyncOperations,
      syncOperations,
    }
  }
}
