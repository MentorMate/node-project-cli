const YAML = require('yaml')
const jetpack = require('fs-jetpack')

module.exports = (toolbox) => {
  toolbox.testWorkflow = async ({ appDir, workflowsFolder }) => {
    const {
      parameters,
      system,
      strings,
      filesystem,
      print: { info },
      prompt,
      template: { generate },
    } = toolbox

    const content = YAML.stringify({
      name: 'Test Workflow',
    })

    jetpack.dir(workflowsFolder)

    jetpack.write(`${appDir}/.github/workflows/test-workflow.yaml`, content)
  }
}
