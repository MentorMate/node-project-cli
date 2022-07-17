const YAML = require('yaml')

module.exports = (toolbox) => {
  toolbox.testWorkflow = ({ appDir, workflowsFolder }) => {
    const {
      filesystem: { dir, writeAsync },
      print: { error, success, muted },
    } = toolbox

    async function asyncOperations() {
      muted('Creating a Test workflow...')
      try {
        const content = YAML.stringify({
          name: 'Test Workflow',
        })
        dir(workflowsFolder)

        await writeAsync(
          `${appDir}/.github/workflows/test-workflow.yaml`,
          content
        )
      } catch (err) {
        error(`An error has occurred while creating a test workflow: ${err}`)
      }

      success('Test workflow created successfully')
    }

    return { asyncOperations }
  }
}
