'use strict';

const { CommandError } = require('../errors/command.error');

module.exports = (toolbox) => {
  toolbox.initializeGit = async ({ appDir, assetsPath }) => {
    const { filesystem, print, system } = toolbox;

    print.muted(`Initializing git...`);

    if (!system.which('git')) {
      throw new CommandError(`Command 'git' not found.`);
    }

    await system.run(`git init && git checkout -b main`, { cwd: appDir });

    await filesystem.copyAsync(
      `${assetsPath}/git/gitignorefile`,
      `${appDir}/.gitignore`
    );
  };
};
