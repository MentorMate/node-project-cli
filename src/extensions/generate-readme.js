'use strict';

module.exports = (toolbox) => {
  toolbox.generateReadme = ({
    projectName,
    projectLanguage,
    features,
    appDir,
    db,
    isExampleApp,
    framework,
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
            dockerCompose: db === 'pg' || isExampleApp,
          },
          setup: {
            docker: features.includes('dockerizeWorkflow'),
            dockerCompose: db === 'pg' || isExampleApp,
            migrations: isExampleApp && db === 'pg',
            tests: {
              unit: true,
              e2e: {
                pg: isExampleApp,
                knex: isExampleApp && db === 'pg',
              },
            },
            openApi: {
              express: isExampleApp && framework === 'express',
              nest: isExampleApp && framework === 'nest',
            },
            licenseChecks: features.includes('licenseChecks'),
          },
          run: {
            build: projectLanguage === 'TS',
            debug: true,
          },
          test: {
            e2e: true,
          },
          debug: {
            vscode: true,
          },
          troubleshooting: {
            openApi: {
              express: isExampleApp && framework === 'express',
            },
          },
        },
      });
    }

    return {
      asyncOperations,
    };
  };
};
