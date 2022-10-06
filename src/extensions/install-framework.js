'use strict'

module.exports = (toolbox) => {
  toolbox.installFramework = async ({
    projectScope,
    projectLanguage,
    framework,
    appDir,
    assetsPath,
  }) => {
    const {
      system: { run },
      print: { error, success, muted },
      filesystem: { dir, copyAsync },
    } = toolbox

    muted(`Installing ${framework}...`)
    try {
      dir(`${appDir}`)
      await run(`cd ${appDir} && npm init -y --scope ${projectScope}`)
      await run(`cd ${appDir} && npm install ${framework}`)

      if (projectLanguage === 'TS') {
        await Promise.all([
          copyAsync(`${assetsPath}/src/`, `${appDir}/src/`),
          copyAsync(`${assetsPath}/test/`, `${appDir}/test/`),
        ])
      }
      await run(`cd ${appDir} && git init && git checkout -b main`)
    } catch (err) {
      error(`An error has occurred while installing ${framework}: ${err}`)
      process.exit(1)
    }

    success(`${framework} installation completed successfully`)
  }
}
