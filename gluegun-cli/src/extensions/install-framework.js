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
      system,
      print: { error, success, muted },
      filesystem: { dir, copyAsync },
    } = toolbox

    muted(`Installing ${framework}...`)
    try {
      dir(`${appDir}`)
      await system.run(`cd ${appDir} && npm init -y --scope ${projectScope}`)
      await system.run(`cd ${appDir} && npm install ${framework}`)

      if (projectLanguage === 'TS') {
        await Promise.all([
          copyAsync(`${assetsPath}/src/`, `${appDir}/src/`),
          copyAsync(`${assetsPath}/test/`, `${appDir}/test/`),
        ])
      }
      await system.run(`cd ${appDir} && git init -b main`)
    } catch (err) {
      error(`An error has occurred while installing ${framework}: ${err}`)
    }

    success(`${framework} installation completed successfully`)
  }
}
