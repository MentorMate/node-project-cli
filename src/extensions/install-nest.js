'use strict';

module.exports = (toolbox) => {
  toolbox.installNest = async ({
    projectName,
    framework,
    appDir,
    assetsPath,
    pkgJson,
    envVars,
    isExampleApp,
    projectLanguage,
  }) => {
    const {
      system: { run },
      print: { success, muted },
      filesystem: { copyAsync, removeAsync },
    } = toolbox;

    muted('Installing Nest...');

    try {
      await run(
        `npx @nestjs/cli@9.4.2 new ${projectName} --directory ${projectName} --strict --skip-git --skip-install --package-manager npm`
      );

      const srcDir = isExampleApp
        ? `${assetsPath}/${framework}/example-app/src/`
        : `${assetsPath}/${framework}/${projectLanguage.toLowerCase()}/src/`;

      await removeAsync(`${appDir}/src/`);
      await removeAsync(`${appDir}/test/`);
      await copyAsync(srcDir, `${appDir}/src/`);

      Object.assign(envVars, {
        HTTP: {
          PORT: 3000,
        },
      });

      Object.assign(pkgJson.dependencies, {
        '@nestjs/platform-fastify': '^9.0.0',
        '@fastify/helmet': '^10.1.1',
        '@fastify/compress': '^6.4.0',
        '@nestjs/config': '^2.3.1',
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
