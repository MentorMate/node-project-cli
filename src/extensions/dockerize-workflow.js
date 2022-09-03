const YAML = require('yaml')

module.exports = (toolbox) => {
  toolbox.dockerizeWorkflow = ({
    projectName,
    projectScope,
    appDir,
    assetsPath,
    workflowsFolder,
    projectLanguage,
    framework,
  }) => {
    const {
      filesystem: { copyAsync },
      print: { error, success, muted },
      system,
      patching,
    } = toolbox

    async function asyncOperations() {
      muted('Creating a Dockerizing workflow step...')
      try {
        await Promise.all([
          copyAsync(`${assetsPath}/.project-npmignr`, `${appDir}/.npmignore`),
          copyAsync(`${assetsPath}/scripts/`, `${appDir}/scripts/`),
          copyAsync(`${assetsPath}/Dockerfile`, `${appDir}/Dockerfile`),
          copyAsync(
            `${assetsPath}/.github/workflows/dockerize.yaml`,
            `${workflowsFolder}/dockerize.yaml`
          ),
        ])

        if (projectLanguage === 'TS') {
          await system.run(`echo "src/" >> ${appDir}/.npmignore`)
          await patching.replace(
            `${appDir}/Dockerfile`,
            './src/index.js',
            './dist/index.js'
          )
        } else {
          await patching.replace(
            `${appDir}/scripts/build_package.sh`,
            'npm run build',
            ''
          )
        }

        if (framework === 'nest') {
          await patching.replace(
            `${appDir}/Dockerfile`,
            '/index.js',
            '/main.js'
          )
        }

        const imageName = projectScope
          ? `${projectScope}/${projectName}`
          : projectName

        await patching.replace(
          `${workflowsFolder}/dockerize.yaml`,
          'custom-app-name',
          imageName.toLowerCase()
        )
      } catch (err) {
        error(
          `An error has occurred while creating a dockerize workflow step: ${err}`
        )
      }

      success('Dockerize workflow step created successfully')
    }

    return { asyncOperations }
  }
}
