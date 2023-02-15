'use strict';

module.exports = (toolbox) => {
  toolbox.installFramework = async ({
    projectLanguage,
    framework,
    appDir,
    assetsPath,
  }) => {
    const {
      filesystem: { copyAsync },
      print: { success, muted },
      system: { run },
    } = toolbox;

    muted(`Installing ${framework}...`);
    try {
      await run(`cd ${appDir} && npm install ${framework}`);

      if (projectLanguage === 'TS') {
        await Promise.all([
          copyAsync(`${assetsPath}/src/`, `${appDir}/src/`),
          copyAsync(`${assetsPath}/test/`, `${appDir}/test/`),
        ]);
      }
    } catch (err) {
      throw new Error(
        `An error has occurred while installing ${framework}: ${err}`
      );
    }

    success(
      `${framework} installation completed successfully. Please wait for the other steps to be completed...`
    );
  };
};
