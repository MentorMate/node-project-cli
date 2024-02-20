import { GluegunToolbox } from 'gluegun'
import { Framework, ProjectLanguage, UserInput } from '../@types';

export default (toolbox: GluegunToolbox) => {
  toolbox.debug = ({
    framework,
    projectLanguage,
    pkgJson,
    assetsPath,
    appDir,
  }: UserInput) => {
    const {
      filesystem: { copyAsync },
    } = toolbox;

    function syncOperations() {
      if (framework === Framework.NEST) {
        return;
      }

      const debugScript =
        projectLanguage === ProjectLanguage.TS
          ? 'tsc --sourceMap -p tsconfig.build.json && tsc-alias && node --inspect -r dotenv/config dist/index'
          : 'node --inspect -r dotenv/config src/index';

      Object.assign(pkgJson.scripts, {
        'start:debug': debugScript,
      });
    }

    async function asyncOperations() {
      await copyAsync(`${assetsPath}/vscode/`, `${appDir}/.vscode/`);
    }

    return {
      syncOperations,
      asyncOperations,
    };
  };
};
