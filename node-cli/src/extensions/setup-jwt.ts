import { GluegunToolbox } from 'gluegun';
import { UserInput } from '../@types';

export default (toolbox: GluegunToolbox) => {
  toolbox.setupJwt = ({ envVars, pkgJson }: UserInput) => {
    const syncOperations = () => {
      Object.assign(envVars, {
        JWT: {
          JWT_SECRET: 'super-secret',
          JWT_EXPIRATION: 7200, // 2h
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
