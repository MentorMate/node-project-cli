module.exports = (toolbox) => {
  toolbox.dockerizeWorkflow = ({
    devSetup,
    projectName,
    appDir,
    assetsPath,
    projectLanguage,
    framework,
    pkgJson,
    isExampleApp,
  }) => {
    const {
      filesystem: { copyAsync },
      print: { success, muted },
      patching,
    } = toolbox;

    async function asyncOperations() {
      muted('Setting up containerization with Docker...');

      const dockerfile = isExampleApp
        ? framework === 'express'
          ? `${assetsPath}/express/example-app/Dockerfile`
          : `${assetsPath}/nest/example-app/Dockerfile`
        : `${assetsPath}/docker/${projectLanguage.toLowerCase()}/Dockerfile`;

      const skipCopyOfDockerfile =
        devSetup && framework === 'express' && isExampleApp;

      await Promise.all([
        !skipCopyOfDockerfile &&
          copyAsync(dockerfile, `${appDir}/Dockerfile`, {
            overwrite: true,
          }),
        copyAsync(`${assetsPath}/.dockerignore`, `${appDir}/.dockerignore`, {
          overwrite: true,
        }),
      ]);

      if (framework === 'nest' && !isExampleApp) {
        await patching.replace(`${appDir}/Dockerfile`, '/index.js', '/main.js');
      }

      success(
        'Containerization with Docker setup successfully. Please wait for the other steps to be completed...'
      );
    }

    asyncOperations.requiredForDevSetup = true;

    function syncOperations() {
      Object.assign(pkgJson.scripts, {
        'image:build': `DOCKER_BUILDKIT=1 docker build -t ${projectName} .`,
        'image:run': `docker run --rm --net host -e NODE_ENV=production --env-file .env ${projectName}`,
        'lint:dockerfile': `docker run --rm -i hadolint/hadolint < Dockerfile`,
      });
    }

    return {
      asyncOperations,
      syncOperations,
    };
  };
};
