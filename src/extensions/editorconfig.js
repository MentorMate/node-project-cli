'use strict';

module.exports = (toolbox) => {
  toolbox.editorconfig = ({ assetsPath, appDir }) => {
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
