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
      print: { debug, success, error, muted },
      prompt,
      meta,
    } = toolbox

    const CLI_PATH = path(`${meta.src}`, '..')
    const ASSETS_PATH = path(CLI_PATH, 'assets')

    const pwd = strings.trim(await system.run('pwd'))
    let projectName = parameters.first
    let userInput = await prompt.ask([
      {
        type: 'input',
        name: 'projectName',
        message: 'Specify a project name:',
        initial: projectName,
        format: (v) => v.replace(/\s/g, '-'),
        result: (v) => v.replace(/\s/g, '-'),
      },
      {
        type: 'input',
        name: 'projectScope',
        message: 'Specify project scope [blank if not scoped]:',
        format: (v) => v.replace(/\s/g, '-'),
        result: (v) => v.replace(/\s/g, '-'),
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
          {
            message: 'Hooks with `husky`',
            value: 'huskyHooks',
            choices: [
              { message: 'Commit message linting', value: 'commitMsgLint' },
              { message: 'Pre-commit hook', value: 'preCommit' },
              { message: 'Pre-push hook', value: 'prePush' },
            ],
          },
          { message: 'GitHub test workflow', value: 'testWorkflow' },
          { message: 'GitHub release workflow', value: 'releaseWorkflow' },
        ],
        initial: [0, 1, 5, 6],
      },
    ])

    userInput.appDir = path(pwd, userInput.projectName)
    userInput.assetsPath = ASSETS_PATH
    userInput.pkgJsonScripts = []
    userInput.pkgJsonInstalls = []
    userInput.workflowsFolder = `${userInput.appDir}/.github/workflows`

    debug(userInput, 'Selected User Input:')
    dir(`${pwd}/${userInput.projectName}`)
    await system.run(
      `cd ${userInput.appDir} && npm init -y --scope ${userInput.projectScope}`
    )

    const stepsOfExecution = [
      toolbox.jsLinters(userInput),
      toolbox.jestConfig(userInput),
    ]

    if (
      userInput.features.includes('huskyHooks') ||
      userInput.features.includes('commitMsgLint') ||
      userInput.features.includes('preCommit') ||
      userInput.features.includes('prePush')
    ) {
      stepsOfExecution.push(toolbox.setupHusky(userInput))
    }

    if (userInput.features.includes('testWorkflow')) {
      stepsOfExecution.push(toolbox.testWorkflow(userInput))
    }

    if (userInput.features.includes('releaseWorkflow')) {
      stepsOfExecution.push(toolbox.releaseWorkflow(userInput))
    }

    const asyncOperations = []

    stepsOfExecution.forEach((step) => {
      step.syncOperations && step.syncOperations()
      step.asyncOperations && asyncOperations.push(step.asyncOperations())
    })

    asyncOperations.push(
      (async () => {
        muted('Installing dev dependencies...')
        try {
          await system.run(
            `cd ${
              userInput.appDir
            } && npm install --save-dev ${userInput.pkgJsonInstalls.join(' ')}`
          )
        } catch (err) {
          error(
            `An error has occurred while installing dev dependencies: ${err}`
          )
        }

        success('All dev dependencies have been installed successfully')
      })()
    )

    await Promise.all(asyncOperations)

    const packageJson = require(`${userInput.appDir}/package.json`)
    packageJson.scripts = userInput.pkgJsonScripts.reduce(
      (acc, scr) => ({ ...acc, ...scr }),
      {}
    )
    write(`${userInput.appDir}/package.json`, packageJson)
  },
}
