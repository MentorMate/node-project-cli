const path = require('path')

module.exports = {
  name: 'generate',
  alias: ['g'],
  run: async (toolbox) => {
    const {
      parameters,
      system,
      strings,
      filesystem,
      print: { info },
      prompt,
    } = toolbox

    const pwd = strings.trim(await system.run('pwd'))
    let projectName = parameters.first
    let userInput = await prompt.ask([
      {
        type: 'input',
        name: 'projectName',
        message: 'Specify a project name:',
        initial: projectName,
      },
      {
        type: 'input',
        name: 'projectScope',
        message: 'Specify project scope [blank if not scoped]:',
      },
      {
        type: 'select',
        name: 'projectLanguage',
        message: 'TypeScript or Vanilla JS',
        choices: [
          { message: 'TypeScript', value: 'TS' },
          { message: 'Vanilla JS', value: 'JS' },
        ],
      },
      {
        type: 'select',
        name: 'moduleType',
        message: 'CommonJS or ES Modules',
        choices: [
          { message: 'CommonJS', value: 'CJS' },
          { message: 'ES Modules', value: 'ESM' },
        ],
      },
      {
        type: 'multiselect',
        name: 'features',
        message: 'Select the features you want to be prebuilt',
        choices: [
          { message: 'JS Code Linters', value: 'JSLinters' },
          { message: 'Bash Script Linters', value: 'bashLinter' },
          { message: 'Pre-commit hooks with `husky`', value: 'preCommitHooks' },
          { message: 'Commit message linting', value: 'commitLinting' },
          { message: 'Branch name linting', value: 'branchLinting' },
          { message: 'GitHub test workflow', value: 'testWorkflow' },
          { message: 'GitHub release workflow', value: 'releaseWorkflow' },
        ],
        initial: [0, 1, 2, 3, 4, 5, 6],
      },
    ])

    userInput.appDir = path.join(pwd, userInput.projectName)
    userInput.workflowsFolder = `${userInput.appDir}/.github/workflows`

    info(userInput)
    filesystem.dir(`${pwd}/${userInput.projectName}`)
    await system.run(
      `cd ${userInput.appDir} && npm init -y --scope ${userInput.projectScope}`
    )

    const stepsOfExecution = [
      toolbox.jsLinters(userInput),
      toolbox.releaseWorkflow(userInput),
      toolbox.testWorkflow(userInput),
    ]

    await Promise.all(stepsOfExecution)
  },
}
