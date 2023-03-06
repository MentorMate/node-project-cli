'use strict';

module.exports = (toolbox) => {
  toolbox.setupPostgreSQL = ({ assetsPath, appDir, envVars, pkgJson }) => {
    const {
      filesystem: { copyAsync },
    } = toolbox;

    const syncOperations = () => {
      Object.assign(envVars, {
        PostgreSQL: {
          PGHOST: 'localhost',
          PGPORT: 5432,
          PGUSER: 'user',
          PGPASSWORD: 'password',
          PGDATABASE: 'default',
        },
      });

      Object.assign(pkgJson.dependencies, {
        pg: '^8.9.0',
      });

      Object.assign(pkgJson.devDependencies, {
        '@types/pg': '^8.6.6',
      });
    };

    const asyncOperations = async () => {
      await copyAsync(
        `${assetsPath}/db/pg/docker-compose.yml`,
        `${appDir}/docker-compose.yml`
      );
    };

    return {
      syncOperations,
      asyncOperations,
    };
  };
};
