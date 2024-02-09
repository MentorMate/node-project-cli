'use strict';

module.exports = (toolbox) => {
  toolbox.setupAuth0Express = ({ envVars, pkgJson }) => {
    const syncOperations = () => {
      Object.assign(envVars, {
        AUTH0: {
          AUTH0_ISSUER_URL: 'https://mock.auth0.com/api/v2/',
          AUTH0_CLIENT_ID: 'CLIENT_ID',
          AUTH0_AUDIENCE: 'AUDIENCE',
          AUTH0_CLIENT_SECRET: 'CLIENT_SECRET',
        },
      });

      Object.assign(pkgJson.dependencies, {
        axios: '^1.6.3',
        'express-jwt': '^8.4.1',
        'express-oauth2-jwt-bearer': '^1.6.0',
        jsonwebtoken: '^9.0.0',
      });

      Object.assign(pkgJson.devDependencies, {
        '@types/jsonwebtoken': '^9.0.1',
      });
    };

    return {
      syncOperations,
    };
  };
};
