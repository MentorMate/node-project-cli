// add your CLI-specific functionality here, which will then be accessible
// to your commands
module.exports = (toolbox) => {
  toolbox.jsLinters = async ({ appDir, projectLanguage, moduleType }) => {
    const {
      parameters,
      system,
      strings,
      filesystem,
      print: { info },
      prompt,
      template: { generate },
    } = toolbox

    await system.run(
      `cd ${appDir} && npm install --save-dev prettier && npm install --save-dev eslint`
    )

    await generate({
      template: 'eslintrc-model.js.ejs',
      target: `${appDir}/.eslintrc.js`,
      props: {
        ts: projectLanguage == 'TS',
        cjs: moduleType == 'CJS',
      },
    })

    //TODO: Install eslint-config-google and ts parsers
  }
}
