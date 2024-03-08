import { GluegunToolbox } from 'gluegun';
import { UserInput } from '../@types';

export default (toolbox: GluegunToolbox) => {
  toolbox.auditConfig = ({ workflowsFolder, assetsPath }: UserInput) => {
    const {
      print: { success, muted },
      filesystem: { copyAsync },
    } = toolbox;

    async function asyncOperations() {
      muted('Configuring Audit...');
      try {
        await copyAsync(
          `${assetsPath}/.github/workflows/audit.yaml`,
          `${workflowsFolder}/audit.yaml`,
        );
      } catch (err) {
        throw new Error(
          `An error has occurred while copying audit workflow: ${err}`,
        );
      }

      success(
        'Audit configured successfully. Please wait for the other steps to be completed...',
      );
    }

    return {
      asyncOperations,
    };
  };
};
