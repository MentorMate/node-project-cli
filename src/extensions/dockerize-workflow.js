module.exports = (toolbox) => {
  toolbox.dockerizeWorkflow = ({
    projectName,
    appDir,
    assetsPath,
    projectLanguage,
    framework,
    pkgJson,
  }) => {
    const {
      filesystem: { copyAsync },
      print: { success, muted },
      patching,
    } = toolbox;

    async function asyncOperations() {
      muted('Setting up containerization with Docker...');
      try {
        await Promise.all([
          copyAsync(`${assetsPath}/Dockerfile`, `${appDir}/Dockerfile`),
          copyAsync(`${assetsPath}/.dockerignore`, `${appDir}/.dockerignore`),
        ]);

        if (projectLanguage === 'TS') {
          await patching.replace(
            `${appDir}/Dockerfile`,
            './src/index.js',
            './dist/index.js'
          );
        }

        if (framework === 'nest') {
          await patching.replace(
            `${appDir}/Dockerfile`,
            '/index.js',
            '/main.js'
          );
        }
      } catch (err) {
        throw new Error(
          `An error has occurred while creating a dockerize workflow step: ${err}`
        );
      }

      success(
        'Containerization with Docker setup successfully. Please wait for the other steps to be completed...'
      );
    }

    function syncOperations() {
      Object.assign(pkgJson.scripts, {
        'image:build': `DOCKER_BUILDKIT=1 docker build -t ${projectName} .`,
        'image:run': `docker run --rm --net host --env-file .env ${projectName}`,
      });
    }

    return {
      asyncOperations,
      syncOperations,
    };
  };
};
