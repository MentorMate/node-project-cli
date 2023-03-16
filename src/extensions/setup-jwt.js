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
