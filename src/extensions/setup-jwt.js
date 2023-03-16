'use strict';

module.exports = (toolbox) => {
  toolbox.setupJwt = ({ envVars, pkgJson }) => {
    const syncOperations = () => {
      Object.assign(envVars, {
        Jwt: {
          JWT_SECRET: 'super-secret',
          JWT_EXPIRATION: 1000000,
        },
      });

      Object.assign(pkgJson.dependencies, {
        jsonwebtoken: '^9.0.0',
        // This package provides its own type definitions
        // @types/express-jwt is depricated
        // see: https://www.npmjs.com/package/@types/express-jwt
        'express-jwt': '^8.4.1',
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
