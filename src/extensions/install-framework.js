'use strict';

module.exports = (toolbox) => {
  toolbox.installFramework = async ({
    projectLanguage,
    framework,
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
      await Promise.all([copyAsync(`${assetsPath}/test/`, `${appDir}/test/`)]);
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
      });

      // with TypeScript
      if (projectLanguage === 'TS') {
        copyAsync(`${assetsPath}/${framework}/src/`, `${appDir}/src/`, {
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
            'db:connection:print': 'ts-node src/database/print-connection',
            'db:migrate:make':
              'knex migrate:make -x ts --migrations-directory ./src/database/migrations',
            'db:migrate:up':
              'ts-node node_modules/.bin/knex migrate:up --migrations-directory ./src/database/migrations --client pg --migrations-table-name knex_migrations --connection $(ts-node src/database/print-connection)',
            'db:migrate:down':
              'ts-node node_modules/.bin/knex migrate:down --migrations-directory ./src/database/migrations --client pg --migrations-table-name knex_migrations --connection $(ts-node src/database/print-connection)',
            'db:migrate:latest':
              'ts-node node_modules/.bin/knex migrate:latest --migrations-directory ./src/database/migrations --client pg --migrations-table-name knex_migrations --connection $(ts-node src/database/print-connection)',
            'db:migrate:rollback':
              'ts-node node_modules/.bin/knex migrate:rollback --migrations-directory ./src/database/migrations --client pg --migrations-table-name knex_migrations --connection $(ts-node src/database/print-connection)',
            'db:migrate:version':
              'ts-node node_modules/.bin/knex migrate:currentVersion --migrations-directory ./src/database/migrations --client pg --migrations-table-name knex_migrations --connection $(ts-node src/database/print-connection)',
            'db:migrate:status':
              'ts-node node_modules/.bin/knex migrate:status --migrations-directory ./src/database/migrations --client pg --migrations-table-name knex_migrations --connection $(ts-node src/database/print-connection)',
            'db:migrate:reset':
              'npm run db:migrate:rollback --all && npm run db:migrate:latest',
          });
        }
      }
    }

    success(
      `${framework} installation completed successfully. Please wait for the other steps to be completed...`
    );
  };
};
