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

    if (framework === 'express') {
      Object.assign(pkgJson.dependencies, {
        helmet: '^6.0.1',
        cors: '^2.8.5',
        compression: '^1.7.4',
      });
    }

    try {
      if (projectLanguage === 'TS') {
        await Promise.all([
          copyAsync(`${assetsPath}/src/`, `${appDir}/src/`),
          copyAsync(`${assetsPath}/test/`, `${appDir}/test/`),
        ]);

        pkgJson.scripts['start'] = 'node dist/index';

        if (framework === 'express') {
          copyAsync(`${assetsPath}/${framework}/src/`, `${appDir}/src/`, {
            overwrite: true,
          });
        }
      }

      if (framework === 'express') {
        Object.assign(pkgJson.devDependencies, {
          '@types/express': '^4.17.17',
          '@types/cors': '^2.8.5',
          '@types/compression': '^1.7.2',
        });
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
