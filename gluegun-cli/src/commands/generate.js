'use strict'

module.exports = {
  name: 'generate',
  alias: ['g'],
  run: async (toolbox) => {
    const {
      parameters,
      system,
      strings,
      filesystem: { path, dir, write },
      print: { info },
      prompt,
      meta
    } = toolbox

    const CLI_PATH = path(`${meta.src}`, '..');
    const ASSETS_PATH = path(CLI_PATH, 'assets');

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
          { message: 'Hooks with `husky`', value: 'huskyHooks', choices: [
            { message: 'Commit message linting', value: 'commitMsgLint' }, 
            { message: 'Pre-commit hook', value: 'preCommit' },
            { message: 'Pre-push hook', value: 'prePush' },
          ]},
          { message: 'GitHub test workflow', value: 'testWorkflow' },
          { message: 'GitHub release workflow', value: 'releaseWorkflow' },
        ],
        initial: [0, 1, 5, 6],
      },
    ])

    userInput.appDir = path(pwd, userInput.projectName)
    userInput.assetsPath = ASSETS_PATH;
    userInput.pkgJsonScripts = [];
    userInput.workflowsFolder = `${userInput.appDir}/.github/workflows`

    info(userInput)
    dir(`${pwd}/${userInput.projectName}`)
    await system.run(
      `cd ${userInput.appDir} && npm init -y --scope ${userInput.projectScope}`
    )

    // TODO: Setup package.json scripts according to features

    const stepsOfExecution = [
      toolbox.jsLinters(userInput),
    ]

    if (userInput.features.includes('huskyHooks') || userInput.features.includes('commitMsgLint') || userInput.features.includes('preCommit') || userInput.features.includes('prePush')) {
      stepsOfExecution.push(toolbox.setupHusky(userInput))
    }

    if (userInput.features.includes('testWorkflow')) {
      stepsOfExecution.push(toolbox.testWorkflow(userInput))
    }

    await Promise.all(stepsOfExecution)

    const packageJson = require(`${userInput.appDir}/package.json`)
    packageJson.scripts = userInput.pkgJsonScripts.reduce((acc, scr) => ({...acc, ...scr}), packageJson.scripts)
    write(`${userInput.appDir}/package.json`, packageJson)
  },
}
