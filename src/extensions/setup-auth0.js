'use strict';

module.exports = (toolbox) => {
  toolbox.setupAuth0 = ({ envVars, pkgJson }) => {
    const syncOperations = () => {
      Object.assign(envVars, {
        AUTH0: {
          AUTH0_ISSUER_URL: 'URL',
          AUTH0_CLIENT_ID: 'https://mock.auth0.com/api/v2/',
          AUTH0_AUDIENCE: 'AUDIENCE',
          AUTH0_CLIENT_SECRET: 'CLIENT_SECRET',
        },
      });

      Object.assign(pkgJson.dependencies, {
        '@nestjs/axios': '^3.0.0',
        '@nestjs/passport': '^10.0.1',
        'passport-jwt': '^4.0.1',
        'jwks-rsa': '^3.0.1',
      });

      Object.assign(pkgJson.devDependencies, {
        '@types/passport-jwt': '^3.0.9',
      });
    };

    return {
      syncOperations,
    };
  };
};
