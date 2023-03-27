'use strict';

module.exports = (toolbox) => {
  toolbox.installFramework = async ({
    projectName,
    projectLanguage,
    framework,
    features,
    appDir,
    assetsPath,
    pkgJson,
    envVars,
    db,
  }) => {
    const {
      filesystem: { copyAsync },
      print: { success, muted },
      template: { generate },
    } = toolbox;

    const frameworkVersion = {
      express: '^4.18.2',
      fastify: '^4.13.0',
    };

    muted(`Installing ${framework}...`);

    Object.assign(envVars, {
      HTTP: {
        PORT: 3000,
      },
    });

    Object.assign(pkgJson.dependencies, {
      [framework]: frameworkVersion[framework],
    });

    Object.assign(pkgJson.devDependencies, {
      dotenv: '^16.0.3',
      nodemon: '^2.0.20',
    });

    const executable =
      projectLanguage === 'TS' ? 'npx ts-node' : 'node -r dotenv/config';

    Object.assign(pkgJson.scripts, {
      start: `${executable} src/index`,
      'start:dev': 'nodemon',
    });

    await generate({
      template: 'nodemon/nodemon.json.ejs',
      target: `${appDir}/nodemon.json`,
      props: {
        ext: projectLanguage === 'TS' ? 'ts' : 'js',
        exec: pkgJson.scripts['start'],
      },
    });

    // TypeScript
    if (projectLanguage === 'TS') {
      Object.assign(pkgJson.scripts, {
        'start:debug':
          'tsc --sourceMap -p tsconfig.build.json && tsc-alias && node --inspect -r dotenv/config dist/index',
      });

      await Promise.all([
        copyAsync(`${assetsPath}/vscode/`, `${appDir}/.vscode/`),
      ]);
    }

    // Express
    if (framework === 'express') {
      Object.assign(pkgJson.dependencies, {
        helmet: '^6.0.1',
        cors: '^2.8.5',
        compression: '^1.7.4',
        'http-terminator': '^3.2.0',
        pino: '^8.11.0',
        'http-errors': '^2.0.0',
        bcrypt: '^5.1.0',
        'query-types': '^0.1.4',
      });

      // with TypeScript
      if (projectLanguage === 'TS') {
        await copyAsync(`${assetsPath}/${framework}/src/`, `${appDir}/src/`, {
          overwrite: true,
        });

        Object.assign(pkgJson.dependencies, {
          zod: '^3.20.6',
          '@asteasolutions/zod-to-openapi': '^4.4.0',
          statuses: '^2.0.1',
        });

        Object.assign(pkgJson.devDependencies, {
          '@types/express': '^4.17.17',
          '@types/cors': '^2.8.5',
          '@types/compression': '^1.7.2',
          '@types/bcrypt': '^5.0.0',
          'pino-pretty': '^9.4.0',
          '@types/http-errors': '^2.0.1',
          '@types/statuses': '^2.0.1',
        });

        // OpenAPI
        // TODO: Move out
        Object.assign(envVars, {
          OpenAPI: {
            SWAGGER_UI_PORT: 3001,
          },
        });

        Object.assign(pkgJson.scripts, {
          'openapi:g': 'ts-node scripts/generate-openapi',
          'openapi:ui:run':
            "docker run --rm -p $(node -r dotenv/config -e 'console.log(process.env.SWAGGER_UI_PORT)'):8080 -v ./.openapi:/openapi -e SWAGGER_JSON=/openapi/openapi.json swaggerapi/swagger-ui",
          'openapi:ui:open':
            'node -r dotenv/config -e \'require("open")(`http://localhost:${process.env.SWAGGER_UI_PORT}`)\'',
          'openapi:serve':
            'concurrently "npm run openapi:ui:run" "npm run openapi:ui:open"',
        });

        Object.assign(pkgJson.devDependencies, {
          concurrently: '^7.6.0',
          open: '^8.4.2',
        });

        await copyAsync(`${assetsPath}/express/scripts`, `${appDir}/scripts`, {
          overwrite: true,
        });

        await copyAsync(`${assetsPath}/express/.openapi`, `${appDir}/.openapi`);

        // Knex
        // TODO: Move out
        if (db === 'pg') {
          Object.assign(envVars, {
            Knex: {
              DEBUG: 'knex:query',
            },
          });

          Object.assign(pkgJson.dependencies, {
            knex: '^2.4.2',
            'pg-error-enum': '^0.6.0',
          });

          Object.assign(pkgJson.scripts, {
            'db:connection:print': 'ts-node scripts/db-connection',
            'db:migrate:make':
              'knex migrate:make -x ts --migrations-directory ./src/modules/database/migrations',
            'db:migrate:up':
              'ts-node node_modules/.bin/knex migrate:up --migrations-directory ./src/modules/database/migrations --client pg --migrations-table-name knex_migrations --connection $(ts-node scripts/db-connection)',
            'db:migrate:down':
              'ts-node node_modules/.bin/knex migrate:down --migrations-directory ./src/modules/database/migrations --client pg --migrations-table-name knex_migrations --connection $(ts-node scripts/db-connection)',
            'db:migrate:latest':
              'ts-node node_modules/.bin/knex migrate:latest --migrations-directory ./src/modules/database/migrations --client pg --migrations-table-name knex_migrations --connection $(ts-node scripts/db-connection)',
            'db:migrate:rollback':
              'ts-node node_modules/.bin/knex migrate:rollback --migrations-directory ./src/modules/database/migrations --client pg --migrations-table-name knex_migrations --connection $(ts-node scripts/db-connection)',
            'db:migrate:version':
              'ts-node node_modules/.bin/knex migrate:currentVersion --migrations-directory ./src/modules/database/migrations --client pg --migrations-table-name knex_migrations --connection $(ts-node scripts/db-connection)',
            'db:migrate:status':
              'ts-node node_modules/.bin/knex migrate:status --migrations-directory ./src/modules/database/migrations --client pg --migrations-table-name knex_migrations --connection $(ts-node scripts/db-connection)',
            'db:migrate:reset':
              'npm run db:migrate:rollback --all && npm run db:migrate:latest',
          });

          await copyAsync(`${assetsPath}/db/pg/scripts`, `${appDir}/scripts`, {
            overwrite: true,
          });
        }
      }
    }

    // README.md
    const isExampleApp =
      projectLanguage === 'TS' && framework === 'express' && db === 'pg';

    if (isExampleApp) {
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
            migrations:
              projectLanguage === 'TS' &&
              framework === 'express' &&
              db === 'pg',
            tests: {
              unit: true,
              e2e: isExampleApp,
            },
          },
          run: {
            build: projectLanguage === 'TS',
            debug: projectLanguage === 'TS',
          },
          test: {
            e2e: isExampleApp,
          },
          debug: {
            vscode: projectLanguage === 'TS',
          },
        },
      });
    }

    success(
      `${framework} installation completed successfully. Please wait for the other steps to be completed...`
    );
  };
};
