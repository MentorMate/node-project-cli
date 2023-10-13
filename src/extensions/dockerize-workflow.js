module.exports = (toolbox) => {
  toolbox.dockerizeWorkflow = ({
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
        ? `${assetsPath}/express/example-app/Dockerfile`
        : `${assetsPath}/docker/${projectLanguage.toLowerCase()}/Dockerfile`;

      await Promise.all([
        copyAsync(dockerfile, `${appDir}/Dockerfile`),
        copyAsync(`${assetsPath}/.dockerignore`, `${appDir}/.dockerignore`),
      ]);

      if (framework === 'nest') {
        const entryPointPath = isExampleApp ? '/src/main.js' : '/main.js';
        await patching.replace(
          `${appDir}/Dockerfile`,
          '/index.js',
          entryPointPath
        );
      }

      success(
        'Containerization with Docker setup successfully. Please wait for the other steps to be completed...'
      );
    }

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
