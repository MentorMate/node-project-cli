'use strict';

module.exports = (toolbox) => {
  toolbox.createProjectDirectory = async ({ appDir }) => {
    const { filesystem, print } = toolbox;

    print.muted(`Creating directory...`);

    if (filesystem.exists(appDir)) {
      throw new Error(`Directory already exists: ${appDir}`);
    }

    filesystem.dir(appDir);
  };
};
