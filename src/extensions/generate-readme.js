'use strict';

module.exports = (toolbox) => {
  toolbox.generateReadme = ({
    projectName,
    projectLanguage,
    features,
    appDir,
    isExampleApp,
    framework,
    db,
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
            dockerCompose: isExampleApp,
          },
          setup: {
            docker: features.includes('dockerizeWorkflow'),
            dockerCompose: {
              express: isExampleApp && framework === 'express',
              nest: isExampleApp && framework === 'nest',
            },
            migrations: isExampleApp && db === 'pg',
            tests: {
              unit: true,
              e2e: {
                db: isExampleApp,
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
