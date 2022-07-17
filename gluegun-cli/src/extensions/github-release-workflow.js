const YAML = require('yaml')

module.exports = (toolbox) => {
  toolbox.releaseWorkflow = ({ appDir, workflowsFolder }) => {
    const {
      filesystem: { dir, writeAsync },
      print: { error, success, muted },
    } = toolbox

    async function asyncOperations() {
      muted('Creating a Release workflow...')
      try {
        const content = YAML.stringify({
          name: 'Release Workflow',
        })
        dir(workflowsFolder)

        await writeAsync(
          `${appDir}/.github/workflows/release-workflow.yaml`,
          content
        )
      } catch (err) {
        error(`An error has occurred while creating a release workflow: ${err}`)
      }

      success('Release workflow created successfully')
    }

    return { asyncOperations }
  }
}
