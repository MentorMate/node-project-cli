'use strict';

module.exports = (toolbox) => {
  toolbox.generateReadme = ({
    projectName,
    projectLanguage,
    features,
    appDir,
    db,
    isExampleApp,
  }) => {
    const {
      template: { generate },
    } = toolbox;

    async function asyncOperations() {
      await generate({
        template: 'README.md.ejs',
        target: `${appDir}/README.md`,
        props: {
          projectName,
          prerequisites: {
            pip3:
              features.includes('huskyHooks') || features.includes('preCommit'),
            docker: features.includes('dockerizeWorkflow'),
            dockerCompose: db === 'pg',
          },
          setup: {
            dockerCompose: db === 'pg',
            migrations: isExampleApp,
            tests: {
              unit: true,
              e2e: isExampleApp,
            },
          },
          run: {
            build: projectLanguage === 'TS',
            debug: true,
          },
          test: {
            e2e: isExampleApp,
          },
          debug: {
            vscode: true,
          },
        },
      });
    }

    return {
      asyncOperations,
    };
  };
};