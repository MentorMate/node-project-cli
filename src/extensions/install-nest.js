'use strict';

module.exports = (toolbox) => {
  toolbox.installNest = async ({
    devSetup,
    projectName,
    authOption,
    framework,
    appDir,
    assetsPath,
    pkgJson,
    envVars,
    isExampleApp,
    projectLanguage,
    db,
  }) => {
    const {
      system: { run },
      print: { success, muted },
      filesystem: { copyAsync, removeAsync },
    } = toolbox;

    muted('Installing Nest...');

    try {
      const srcDir = isExampleApp
        ? `${assetsPath}/${framework}/example-app-${db}/src/`
        : `${assetsPath}/${framework}/${projectLanguage.toLowerCase()}/src/`;
      const testDir = isExampleApp
        ? `${assetsPath}/${framework}/example-app-${db}/test/`
        : `${assetsPath}/${framework}/${projectLanguage.toLowerCase()}/test/`;

      if (!devSetup) {
        await run(
          `npx @nestjs/cli@9.4.2 new ${projectName} --directory ${projectName} --strict --skip-git --skip-install --package-manager npm`,
        );

        await Promise.all([
          removeAsync(`${appDir}/src/`),
          removeAsync(`${appDir}/test/`),
        ]);

        await Promise.all([
          copyAsync(srcDir, `${appDir}/src/`),
          copyAsync(testDir, `${appDir}/test/`),
        ]);

        if (isExampleApp) {
          await Promise.all([
            removeAsync(`${appDir}/src/api/auth`),
            removeAsync(`${appDir}/test/auth`),
            removeAsync(`${appDir}/test/todos`),
          ]);

          await Promise.all([
            await copyAsync(
              `${assetsPath}/${framework}/multiple-choice-features/authorization/${db}/${authOption}`,
              `${appDir}/src/api/auth`,
            ),
            await copyAsync(
              `${assetsPath}/${framework}/multiple-choice-features/authorization/${db}/test/${authOption}/todos`,
              `${appDir}/test/todos`,
            ),

            authOption === 'jwt' &&
              (await copyAsync(
                `${assetsPath}/${framework}/multiple-choice-features/authorization/${db}/test/${authOption}/auth`,
                `${appDir}/test/auth`,
              )),
          ]);
        }
      }

      Object.assign(envVars, {
        HTTP: {
          PORT: 3000,
        },
      });

      if (isExampleApp && authOption === 'auth0') {
        Object.assign(pkgJson.dependencies, {
          '@nestjs/axios': '^3.0.0',
        });
      }

      Object.assign(pkgJson.dependencies, {
        '@nestjs/platform-fastify': '^9.0.0',
        '@fastify/helmet': '^10.1.1',
        '@fastify/compress': '^6.4.0',
        '@nestjs/config': '^2.3.1',
      });

      Object.assign(pkgJson.scripts, {
        start:
          'node -r dotenv/config ./node_modules/@nestjs/cli/bin/nest.js start',
        'start:debug':
          'node -r dotenv/config ./node_modules/@nestjs/cli/bin/nest.js start --debug --watch',
        'start:dev':
          'node -r dotenv/config ./node_modules/@nestjs/cli/bin/nest.js start --watch',
      });

      // Example Nest app
      if (isExampleApp) {
        Object.assign(pkgJson.dependencies, {
          '@nestjs/swagger': '^6.3.0',
          'class-transformer': '^0.5.1',
          'class-validator': '^0.14.0',
          statuses: '^2.0.1',
          bcrypt: '^5.1.0',
        });

        if (authOption === 'auth0') {
          Object.assign(pkgJson.dependencies, {
            '@nestjs/passport': '^10.0.1',
            'passport-jwt': '^4.0.1',
            'jwks-rsa': '^3.0.1',
          });
        }

        Object.assign(pkgJson.devDependencies, {
          '@fastify/static': '^6.10.2',
          '@golevelup/ts-jest': '^0.4.0',
          typescript: '^4.9.5',
          '@types/statuses': '^2.0.1',
          '@types/bcrypt': '^5.0.0',
          '@types/uuid': '^9.0.1',
          uuid: '^9.0.0',
        });

        if (authOption === 'auth0') {
          Object.assign(pkgJson.devDependencies, {
            '@types/passport-jwt': '^3.0.9',
          });
        }

        if (!devSetup) {
          await Promise.all(
            [
              copyAsync(
                `${assetsPath}/nest/example-app-${db}/.openapi/gitignorefile`,
                `${appDir}/.openapi/.gitignore`,
              ),
              copyAsync(
                `${assetsPath}/nest/example-app-${db}/docker-compose.yml`,
                `${appDir}/docker-compose.yml`,
              ),
              copyAsync(
                `${assetsPath}/nest/example-app-${db}/docker-compose.override.example.yml`,
                `${appDir}/docker-compose.override.example.yml`,
              ),
              copyAsync(
                `${assetsPath}/nest/example-app-${db}/migrations`,
                `${appDir}/migrations`,
              ),
              copyAsync(
                `${assetsPath}/${framework}/example-app-${db}/tsconfig.build.json`,
                `${appDir}/tsconfig.build.json`,
                { overwrite: true },
              ),
              copyAsync(
                `${assetsPath}/nest/example-app-${db}/tsconfig.json`,
                `${appDir}/tsconfig.json`,
                { overwrite: true },
              ),
              db === 'pg' &&
                copyAsync(`${assetsPath}/db/pg/scripts`, `${appDir}/scripts`, {
                  overwrite: true,
                }),
            ].filter(Boolean),
          );
        }

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
            'db:migrate:make':
              'knex migrate:make -x ts --migrations-directory ./migrations',
            'db:migrate:up':
              'ts-node node_modules/knex/bin/cli.js migrate:up --migrations-directory ./migrations --client pg --migrations-table-name knex_migrations --connection $(ts-node scripts/db-connection)',
            'db:migrate:down':
              'ts-node node_modules/knex/bin/cli.js migrate:down --migrations-directory ./migrations --client pg --migrations-table-name knex_migrations --connection $(ts-node scripts/db-connection)',
            'db:migrate:latest':
              'ts-node node_modules/knex/bin/cli.js migrate:latest --migrations-directory ./migrations --client pg --migrations-table-name knex_migrations --connection $(ts-node scripts/db-connection)',
            'db:migrate:rollback':
              'ts-node node_modules/knex/bin/cli.js migrate:rollback --migrations-directory ./migrations --client pg --migrations-table-name knex_migrations --connection $(ts-node scripts/db-connection)',
            'db:migrate:version':
              'ts-node node_modules/knex/bin/cli.js migrate:currentVersion --migrations-directory ./migrations --client pg --migrations-table-name knex_migrations --connection $(ts-node scripts/db-connection)',
            'db:migrate:status':
              'ts-node node_modules/knex/bin/cli.js migrate:status --migrations-directory ./migrations --client pg --migrations-table-name knex_migrations --connection $(ts-node scripts/db-connection)',
            'db:migrate:reset':
              'npm run db:migrate:rollback --all && npm run db:migrate:latest',
          });
        } else if (db === 'mongodb') {
          // TODO: Think of a way to call the migrations with a npm script command
          Object.assign(pkgJson.scripts, {
            'db:migrate:latest': 'echo "TODO"',
            'db:migrate:rollback': 'echo "TODO"',
          });
        }
      }
    } catch (err) {
      throw new Error(`An error has occurred while installing Nest: ${err}`);
    }

    success(
      'Nest installation completed successfully. Please wait for the other steps to be completed...',
    );
  };
};
