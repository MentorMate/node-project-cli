'use strict';

const { CommandError } = require('../errors/command.error');

module.exports = (toolbox) => {
  toolbox.createProjectDirectory = async ({ appDir }) => {
    const { filesystem, print } = toolbox;

    print.muted(`Creating directory...`);

    if (filesystem.exists(appDir)) {
      throw new CommandError(`Directory already exists: ${appDir}`);
    }

    filesystem.dir(appDir);
  };
};
