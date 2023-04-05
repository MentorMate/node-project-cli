'use strict';

module.exports = (toolbox) => {
  toolbox.auditConfig = ({ workflowsFolder, assetsPath }) => {
    const {
      print: { success, muted },
      filesystem: { copyAsync },
    } = toolbox;

    async function asyncOperations() {
      muted('Configuring Audit...');
      try {
        await copyAsync(
          `${assetsPath}/.github/workflows/audit.yaml`,
          `${workflowsFolder}/audit.yaml`
        );
      } catch (err) {
        throw new Error(
          `An error has occurred while copying audit workflow: ${err}`
        );
      }

      success(
        'Audit configured successfully. Please wait for the other steps to be completed...'
      );
    }

    return {
      asyncOperations,
    };
  };
};
