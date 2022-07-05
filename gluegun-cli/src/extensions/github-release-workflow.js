const YAML = require('yaml')
const jetpack = require('fs-jetpack')

module.exports = (toolbox) => {
  toolbox.releaseWorkflow = async ({ appDir, workflowsFolder }) => {
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
      name: 'Release Workflow',
    })

    jetpack.dir(workflowsFolder)

    jetpack.write(`${appDir}/.github/workflows/release-workflow.yaml`, content)
  }
}
