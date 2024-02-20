import { GluegunToolbox } from 'gluegun'
import { Database, Framework, ProjectLanguage, UserInput } from '../@types';

export default (toolbox: GluegunToolbox) => {
  toolbox.generateReadme = ({
    projectName,
    projectLanguage,
    features,
    appDir,
    isExampleApp,
    framework,
    db,
  }: UserInput) => {
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
              express: isExampleApp && framework === Framework.EXPRESS,
              nest: isExampleApp && framework === Framework.NEST,
            },
            migrations: isExampleApp && db === Database.POSTGRESQL,
            tests: {
              unit: true,
              e2e: {
                db: isExampleApp,
                knex: isExampleApp && db === Database.POSTGRESQL,
              },
            },
            openApi: {
              express: isExampleApp && framework === Framework.EXPRESS,
              nest: isExampleApp && framework === Framework.NEST,
            },
            licenseChecks: features.includes('licenseChecks'),
          },
          run: {
            build: projectLanguage === ProjectLanguage.TS,
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
              express: isExampleApp && framework === Framework.EXPRESS,
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
