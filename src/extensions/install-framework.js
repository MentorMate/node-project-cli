'use strict';

module.exports = (toolbox) => {
  toolbox.installFramework = async ({
    projectLanguage,
    framework,
    appDir,
    assetsPath,
    pkgJson,
  }) => {
    const {
      filesystem: { copyAsync },
      print: { success, muted },
    } = toolbox;

    const frameworkVersion = {
      express: '^4.18.2',
      fastify: '^4.13.0',
    };

    muted(`Installing ${framework}...`);

    pkgJson.dependencies[framework] = frameworkVersion[framework];

    try {
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
