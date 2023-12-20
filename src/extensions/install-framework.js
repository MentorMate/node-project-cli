'use strict';

module.exports = (toolbox) => {
  toolbox.installFramework = async ({
    devSetup,
    projectLanguage,
    framework,
    appDir,
    assetsPath,
    pkgJson,
    envVars,
    isExampleApp,
  }) => {
    const {
      filesystem: { copyAsync },
      print: { success, muted },
      template: { generate },
    } = toolbox;

    muted(`Installing ${framework}...`);

    Object.assign(envVars, {
      HTTP: {
        PORT: 3000,
      },
      Logging: {
        ERROR_LOGGING: true,
        REQUEST_LOGGING: true,
      },
      Swagger: {
        SWAGGER: true,
      },
    });

    Object.assign(pkgJson.dependencies, {
      'http-terminator': '^3.2.0',
    });

    Object.assign(pkgJson.devDependencies, {
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

    // Express
    if (framework === 'express') {
      Object.assign(pkgJson.dependencies, {
        express: '^4.18.2',
        helmet: '^6.0.1',
        compression: '^1.7.4',
        cors: '^2.8.5',
      });

      // with TypeScript
      if (projectLanguage === 'TS') {
        Object.assign(pkgJson.devDependencies, {
          '@types/express': '^4.17.17',
          '@types/compression': '^1.7.2',
          '@types/cors': '^2.8.5',
        });
      }
    }

    const srcDir = isExampleApp
      ? `${assetsPath}/${framework}/example-app/src/`
      : `${assetsPath}/${framework}/${projectLanguage.toLowerCase()}/src/`;

    if (!devSetup) {
      await copyAsync(srcDir, `${appDir}/src/`);
    }

    // Example Express app
    if (isExampleApp) {
      Object.assign(pkgJson.dependencies, {
        pino: '^8.11.0',
        '@paralleldrive/cuid2': '^2.2.2',
        'http-errors': '^2.0.0',
        bcrypt: '^5.1.0',
        'query-types': '^0.1.4',
        statuses: '^2.0.1',
        zod: '^3.20.6',
        'zod-openapi': '~2.2.2',
      });

      Object.assign(pkgJson.devDependencies, {
        'pino-pretty': '^9.4.0',
        '@types/http-errors': '^2.0.1',
        '@types/bcrypt': '^5.0.0',
        '@types/statuses': '^2.0.1',
        '@types/uuid': '^9.0.1',
        uuid: '^9.0.0',
      });

      // OpenAPI
      // TODO: Move out
      Object.assign(pkgJson.scripts, {
        'openapi:g': 'ts-node scripts/generate-openapi',
      });

      if (!devSetup) {
        await Promise.all([
          copyAsync(
            `${assetsPath}/express/example-app/scripts/generate-openapi.ts`,
            `${appDir}/scripts/generate-openapi.ts`,
          ),
          copyAsync(
            `${assetsPath}/express/example-app/.openapi/gitignorefile`,
            `${appDir}/.openapi/.gitignore`,
          ),
          copyAsync(
            `${assetsPath}/express/example-app/docker-compose.yml`,
            `${appDir}/docker-compose.yml`,
          ),
          copyAsync(
            `${assetsPath}/express/example-app/docker-compose.override.example.yml`,
            `${appDir}/docker-compose.override.example.yml`,
          ),
          copyAsync(
            `${assetsPath}/express/example-app/migrations`,
            `${appDir}/migrations`,
          ),
          copyAsync(`${assetsPath}/db/pg/scripts`, `${appDir}/scripts`, {
            overwrite: true,
          }),
        ]);
      }

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
          'knex migrate:make -x ts --migrations-directory ./migrations',
        'db:migrate:up':
          'ts-node node_modules/.bin/knex migrate:up --migrations-directory ./migrations --client pg --migrations-table-name knex_migrations --connection $(ts-node scripts/db-connection)',
        'db:migrate:down':
          'ts-node node_modules/.bin/knex migrate:down --migrations-directory ./migrations --client pg --migrations-table-name knex_migrations --connection $(ts-node scripts/db-connection)',
        'db:migrate:latest':
          'ts-node node_modules/.bin/knex migrate:latest --migrations-directory ./migrations --client pg --migrations-table-name knex_migrations --connection $(ts-node scripts/db-connection)',
        'db:migrate:rollback':
          'ts-node node_modules/.bin/knex migrate:rollback --migrations-directory ./migrations --client pg --migrations-table-name knex_migrations --connection $(ts-node scripts/db-connection)',
        'db:migrate:version':
          'ts-node node_modules/.bin/knex migrate:currentVersion --migrations-directory ./migrations --client pg --migrations-table-name knex_migrations --connection $(ts-node scripts/db-connection)',
        'db:migrate:status':
          'ts-node node_modules/.bin/knex migrate:status --migrations-directory ./migrations --client pg --migrations-table-name knex_migrations --connection $(ts-node scripts/db-connection)',
        'db:migrate:reset':
          'npm run db:migrate:rollback --all && npm run db:migrate:latest',
      });
    }

    success(
      `${framework} installation completed successfully. Please wait for the other steps to be completed...`,
    );
  };
};
