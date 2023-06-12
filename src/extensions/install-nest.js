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
    build,
  }) => {
    const {
      system: { run },
      print: { success, muted },
      filesystem: { copyAsync },
    } = toolbox;

    muted('Installing Nest...');

    await run(
      `npx @nestjs/cli@9.4.2 new ${projectName} --directory ${projectName} --skip-git --skip-install --package-manager npm`
    );

    const variantDir = isExampleApp ? 'example-app' : 'ts';
    const variantPath = `${assetsPath}/${framework}/${variantDir}`;

    await copyAsync(`${variantPath}/src/`, `${appDir}/src/`, {
      overwrite: true,
    });

    Object.assign(build, {
      entryPoint: 'main.js',
      ...(isExampleApp && {
        rebuildDependencies: ['bcrypt'],
      }),
    });

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

    success(
      'Nest installation completed successfully. Please wait for the other steps to be completed...'
    );
  };
};
