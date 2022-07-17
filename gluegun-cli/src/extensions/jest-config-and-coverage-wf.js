'use strict'

module.exports = (toolbox) => {
  toolbox.jestConfig = ({
    appDir,
    workflowsFolder,
    pkgJsonScripts,
    pkgJsonInstalls,
    assetsPath,
  }) => {
    const {
      print: { error, success, muted },
      filesystem: { dir, copyAsync },
    } = toolbox

    async function asyncOperations() {
      muted('Configuring Jest...')
      try {
        dir(workflowsFolder)

        await Promise.all([
          copyAsync(
            `${assetsPath}/.github/workflows/coverage.yaml`,
            `${workflowsFolder}/coverage.yaml`
          ),
          copyAsync(`${assetsPath}/jest.config.js`, `${appDir}/jest.config.js`),
        ])
      } catch (err) {
        error(
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
    }

    return {
      asyncOperations,
      syncOperations,
    }
  }
}
