import { GluegunToolbox } from 'gluegun';
import { UserInput } from '../@types';

export default (toolbox: GluegunToolbox) => {
  toolbox.setupMongoDB = ({
    assetsPath,
    appDir,
    envVars,
    pkgJson,
    isExampleApp,
  }: UserInput) => {
    const {
      filesystem: { copyAsync },
    } = toolbox;

    const syncOperations = () => {
      Object.assign(envVars, {
        MongoDB: {
          MONGO_PROTOCOL: 'mongodb',
          MONGO_HOST: 'localhost',
          MONGO_PORT: 27017,
          MONGO_USER: 'user',
          MONGO_PASSWORD: 'password',
          MONGO_DATABASE_NAME: 'example-app',
        },
      });

      Object.assign(pkgJson.dependencies, {
        mongodb: '^6.3.0',
      });
    };

    const asyncOperations = async () => {
      // TODO: move out somehow
      if (isExampleApp) {
        return;
      }

      await Promise.all([
        copyAsync(
          `${assetsPath}/db/mongodb/docker-compose.yml`,
          `${appDir}/docker-compose.yml`,
        ),
      ]);
    };

    return {
      syncOperations,
      asyncOperations,
    };
  };
};
