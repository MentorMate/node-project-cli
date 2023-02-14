module.exports = (toolbox) => {
  toolbox.dockerizeWorkflow = ({
    projectName,
    projectScope,
    appDir,
    assetsPath,
    workflowsFolder,
    projectLanguage,
    framework,
    pkgJsonScripts,
  }) => {
    const {
      filesystem: { copyAsync },
      print: { success, muted },
      system: { run },
      patching,
    } = toolbox;

    async function asyncOperations() {
      muted('Creating a Dockerizing workflow step...');
      try {
        await Promise.all([
          copyAsync(`${assetsPath}/.project-npmignr`, `${appDir}/.npmignore`),
          copyAsync(`${assetsPath}/scripts/`, `${appDir}/scripts/`),
          copyAsync(`${assetsPath}/Dockerfile`, `${appDir}/Dockerfile`),
          copyAsync(`${assetsPath}/.dockerignore`, `${appDir}/.dockerignore`),
          copyAsync(
            `${assetsPath}/.github/workflows/dockerize.yaml`,
            `${workflowsFolder}/dockerize.yaml`
          ),
        ]);

        if (projectLanguage === 'TS') {
          await run(`echo "src/" >> ${appDir}/.npmignore`);
          await patching.replace(
            `${appDir}/Dockerfile`,
            './src/index.js',
            './dist/index.js'
          );
        } else {
          await patching.replace(
            `${appDir}/scripts/build_package.sh`,
            'npm run build',
            ''
          );
        }

        if (framework === 'nest') {
          await patching.replace(
            `${appDir}/Dockerfile`,
            '/index.js',
            '/main.js'
          );
        }

        const imageName = projectScope
          ? `${projectScope}_${projectName}`
          : projectName;

        await patching.replace(
          `${workflowsFolder}/dockerize.yaml`,
          'custom-app-name',
          imageName.toLowerCase()
        );
      } catch (err) {
        throw new Error(
          `An error has occurred while creating a dockerize workflow step: ${err}`
        );
      }

      success(
        'Dockerize workflow step created successfully. Please wait for the other steps to be completed...'
      );
    }

    function syncOperations() {
      pkgJsonScripts.push({
        'image:build': `DOCKER_BUILDKIT=1 docker build -t ${projectName} .`,
        // TODO: add `--env-file .env` with .env support
        'image:run': `docker run --rm --net host ${projectName}`,
      });
    }

    return {
      asyncOperations,
      syncOperations,
    };
  };
};
