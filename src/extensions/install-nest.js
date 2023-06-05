'use strict';

module.exports = (toolbox) => {
  toolbox.installNest = async ({
    projectName,
    framework,
    appDir,
    assetsPath,
    pkgJson,
    envVars,
  }) => {
    const {
      system: { run },
      print: { success, muted },
      filesystem: { copyAsync },
    } = toolbox;

    muted('Installing Nest...');

    try {
      await run(
        `npx @nestjs/cli@9.4.2 new ${projectName} --directory ${projectName} --skip-git --skip-install --package-manager npm`
      );

      await copyAsync(
        `${assetsPath}/${framework}/src/main.ts`,
        `${appDir}/src/main.ts`,
        { overwrite: true }
      );

      await copyAsync(
        `${assetsPath}/${framework}/src/app.module.ts`,
        `${appDir}/src/app.module.ts`,
        { overwrite: true }
      );

      Object.assign(envVars, {
        HTTP: {
          PORT: 3000,
        },
      });

      Object.assign(pkgJson.dependencies, {
        helmet: '^6.0.1',
        compression: '^1.7.4',
        '@nestjs/config': '^2.3.1',
      });

      Object.assign(pkgJson.devDependencies, {
        '@types/compression': '^1.7.2',
      });

      Object.assign(pkgJson.scripts, {
        start: 'node -r dotenv/config ./node_modules/.bin/nest start',
        'start:debug':
          'node -r dotenv/config ./node_modules/.bin/nest start --debug --watch',
        'start:dev':
          'node -r dotenv/config ./node_modules/.bin/nest start --watch',
      });
    } catch (err) {
      throw new Error(`An error has occurred while installing Nest: ${err}`);
    }

    success(
      'Nest installation completed successfully. Please wait for the other steps to be completed...'
    );
  };
};
