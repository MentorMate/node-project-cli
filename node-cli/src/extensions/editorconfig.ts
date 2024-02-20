import { GluegunToolbox } from 'gluegun';
import { UserInput } from '../@types';

export default (toolbox: GluegunToolbox) => {
  toolbox.editorconfig = ({ assetsPath, appDir }: UserInput) => {
    const {
      filesystem: { copyAsync },
    } = toolbox;

    async function asyncOperations() {
      await copyAsync(`${assetsPath}/.editorconfig`, `${appDir}/.editorconfig`);
    }

    return {
      asyncOperations,
    };
  };
};
